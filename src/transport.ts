import { APIError } from "./error.js";
import { sign } from "./signer.js";
import type { EasyIDOptions } from "./types.js";

export const DEFAULT_BASE_URL = "https://api.easyid.com";
export const VERSION = "1.0.0";
const MAX_RESPONSE_BYTES = 10 << 20;

export interface MultipartFile {
  fieldName: string;
  data: Uint8Array | string;
  filename: string;
  contentType?: string;
}

export class Transport {
  readonly keyId: string;
  readonly secret: string;
  readonly baseURL: string;
  readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(keyId: string, secret: string, options: EasyIDOptions = {}) {
    this.keyId = keyId;
    this.secret = secret;
    this.baseURL = (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async requestJSON<T>(
    method: string,
    path: string,
    query?: Record<string, string>,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const bodyBytes = body ? Buffer.from(JSON.stringify(body), "utf8") : new Uint8Array();
    return this.send<T>(method, path, query, bodyBytes, "application/json");
  }

  async requestMultipart<T>(
    path: string,
    fields: Record<string, string>,
    files: MultipartFile[],
  ): Promise<T> {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, value);
    }
    for (const file of files) {
      const content = typeof file.data === "string" ? Buffer.from(file.data, "utf8") : Buffer.from(file.data);
      const blob = new Blob([content], {
        type: file.contentType ?? "application/octet-stream",
      });
      form.append(file.fieldName, blob, file.filename);
    }
    const request = new Request("https://easyid.invalid", { method: "POST", body: form });
    const bodyBytes = new Uint8Array(await request.arrayBuffer());
    const contentType = request.headers.get("content-type");
    if (!contentType) {
      throw new Error("easyid: multipart content-type missing");
    }
    return this.send<T>("POST", path, undefined, bodyBytes, contentType);
  }

  private async send<T>(
    method: string,
    path: string,
    query: Record<string, string> | undefined,
    bodyBytes: Uint8Array,
    contentType: string,
  ): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = sign(this.secret, timestamp, query, bodyBytes);
    const url = new URL(this.baseURL + path);
    if (query) {
      for (const key of Object.keys(query).sort()) {
        url.searchParams.append(key, query[key]);
      }
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(url, {
        method,
        body: bodyBytes.length > 0 ? Buffer.from(bodyBytes) : undefined,
        headers: {
          "Content-Type": contentType,
          "X-Key-ID": this.keyId,
          "X-Timestamp": timestamp,
          "X-Signature": signature,
          "User-Agent": `easyid-node/${VERSION}`,
        },
        signal: controller.signal,
      });
      const raw = new Uint8Array(await response.arrayBuffer());
      if (raw.byteLength > MAX_RESPONSE_BYTES) {
        throw new Error("easyid: response exceeds 10 MB limit");
      }
      const text = Buffer.from(raw).toString("utf8");
      if (!response.ok) {
        const apiError = this.tryParseAPIError(text);
        if (apiError) {
          throw apiError;
        }
        throw new Error(`easyid: http status ${response.status}`);
      }
      let payload: { code: number; message: string; request_id: string; data: T };
      try {
        payload = JSON.parse(text);
      } catch (error) {
        throw new Error(`easyid: decode response (status=${response.status}): ${String(error)}`);
      }
      if (payload.code !== 0) {
        throw new APIError(payload.code, payload.message, payload.request_id);
      }
      return payload.data;
    } finally {
      clearTimeout(timer);
    }
  }

  private tryParseAPIError(text: string): APIError | undefined {
    try {
      const payload = JSON.parse(text) as { code?: number; message?: string; request_id?: string };
      if (typeof payload.code === "number" && payload.code !== 0) {
        return new APIError(payload.code, payload.message ?? "", payload.request_id ?? "");
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}
