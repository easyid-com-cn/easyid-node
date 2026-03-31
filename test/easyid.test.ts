import { createServer } from "node:http";
import { Buffer } from "node:buffer";
import { afterEach, describe, expect, it } from "vitest";

import { APIError, EasyID, isAPIError, sign } from "../src/index.js";

interface RecordedRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: Buffer;
}

const keyId = "ak_3f9a2b1c7d4e8f0a";
const secret = "sk_test";

const servers: Array<ReturnType<typeof createServer>> = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

const startServer = async (
  handler: (request: RecordedRequest) => { status: number; contentType: string; body: string },
) => {
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const query: Record<string, string> = {};
      for (const [key, value] of url.searchParams.entries()) {
        query[key] = value;
      }
      const response = handler({
        method: req.method ?? "",
        path: url.pathname,
        query,
        headers: Object.fromEntries(
          Object.entries(req.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value ?? ""]),
        ),
        body: Buffer.concat(chunks),
      });
      res.statusCode = response.status;
      res.setHeader("Content-Type", response.contentType);
      res.end(response.body);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("missing server address");
  }
  return `http://127.0.0.1:${address.port}`;
};

const ok = (data: unknown) => JSON.stringify({ code: 0, message: "success", request_id: "test-rid", data });

describe("EasyID TypeScript SDK", () => {
  it("covers all public APIs and validation flows", async () => {
    const assertions: Array<Promise<void>> = [];
    const baseURL = await startServer((request) => {
      expect(request.headers["x-key-id"]).toBe(keyId);
      expect(request.headers["x-timestamp"]).toMatch(/^\d+$/);
      expect(request.headers["x-signature"]).not.toBe("");
      if (request.path === "/v1/idcard/verify2") {
        return { status: 200, contentType: "application/json", body: ok({ result: true, match: true, supplier: "aliyun", score: 0.98 }) };
      }
      if (request.path === "/v1/idcard/verify3") {
        return { status: 200, contentType: "application/json", body: ok({ result: true, match: true, supplier: "tencent", score: 0.95 }) };
      }
      if (request.path === "/v1/ocr/idcard") {
        expect(request.body.includes(Buffer.from('name="side"'))).toBe(true);
        expect(request.body.includes(Buffer.from('name="image"'))).toBe(true);
        const expected = sign(secret, request.headers["x-timestamp"], undefined, request.body);
        expect(request.headers["x-signature"]).toBe(expected);
        return { status: 200, contentType: "application/json", body: ok({ side: "front", name: "张三", id_number: "110101199001011234" }) };
      }
      if (request.path === "/v1/phone/status") {
        expect(request.query.phone).toBe("13800138000");
        const expected = sign(secret, request.headers["x-timestamp"], request.query, new Uint8Array());
        expect(request.headers["x-signature"]).toBe(expected);
        return { status: 200, contentType: "application/json", body: ok({ status: "real", carrier: "移动", province: "广东", roaming: false }) };
      }
      if (request.path === "/v1/phone/verify3") {
        return { status: 200, contentType: "application/json", body: ok({ result: true, match: true, supplier: "aliyun", score: 0.99 }) };
      }
      if (request.path === "/v1/face/liveness") {
        return { status: 200, contentType: "application/json", body: ok({ liveness: true, score: 0.97, method: "passive", frames_analyzed: 10, attack_type: null }) };
      }
      if (request.path === "/v1/face/compare") {
        return { status: 200, contentType: "application/json", body: ok({ match: true, score: 0.92 }) };
      }
      if (request.path === "/v1/face/verify") {
        return { status: 200, contentType: "application/json", body: ok({ result: true, supplier: "aliyun", score: 0.96 }) };
      }
      if (request.path === "/v1/bank/verify4") {
        return { status: 200, contentType: "application/json", body: ok({ result: true, match: true, bank_name: "工商银行", supplier: "aliyun", score: 0.99, masked_bank_card: "6222****1234", card_type: "debit" }) };
      }
      if (request.path === "/v1/risk/score") {
        return { status: 200, contentType: "application/json", body: ok({ risk_score: 30, reasons: ["new_device"], recommendation: "allow", details: { rule_score: null, ml_score: null } }) };
      }
      if (request.path === "/v1/device/fingerprint") {
        return { status: 200, contentType: "application/json", body: ok({ device_id: "dev_abc", stored: true }) };
      }
      if (request.path === "/v1/billing/balance") {
        return { status: 200, contentType: "application/json", body: ok({ app_id: "app_001", available_cents: 100000 }) };
      }
      if (request.path === "/v1/billing/records") {
        return { status: 200, contentType: "application/json", body: ok({ total: 1, page: 1, records: [{ id: 1, app_id: "app_001", request_id: "req_001", change_cents: -100, balance_before: 100100, balance_after: 100000, reason: "idcard_verify2", operator: "system", created_at: 1711900000 }] }) };
      }
      return { status: 404, contentType: "application/json", body: "{}" };
    });

    const client = new EasyID(keyId, secret, { baseURL });
    await expect(client.idcard.verify2({ name: "张三", idNumber: "110101199001011234" })).resolves.toMatchObject({ result: true });
    await expect(client.idcard.verify3({ name: "张三", idNumber: "110101199001011234", mobile: "13800138000" })).resolves.toMatchObject({ match: true });
    await expect(client.idcard.ocr("front", "image-bytes", "id.jpg")).resolves.toMatchObject({ name: "张三" });
    await expect(client.phone.status("13800138000")).resolves.toMatchObject({ status: "real" });
    await expect(client.phone.verify3({ name: "张三", idNumber: "110101199001011234", mobile: "13800138000" })).resolves.toMatchObject({ result: true });
    await expect(client.face.liveness("video", "passive", "video.mp4")).resolves.toMatchObject({ liveness: true });
    await expect(client.face.compare("img1", "img2", "a.jpg", "b.jpg")).resolves.toMatchObject({ match: true });
    await expect(client.face.verify({ idNumber: "110101199001011234", mediaKey: "oss://bucket/key" })).resolves.toMatchObject({ result: true });
    await expect(client.bank.verify4({ name: "张三", idNumber: "110101199001011234", bankCard: "6222021234567890", mobile: "13800138000" })).resolves.toMatchObject({ card_type: "debit" });
    await expect(client.risk.score({ ip: "1.2.3.4", deviceId: "dev_abc", action: "login" })).resolves.toMatchObject({ risk_score: 30 });
    await expect(client.risk.storeFingerprint({ deviceId: "dev_abc", fingerprint: { canvas: "hash123" } })).resolves.toMatchObject({ stored: true });
    await expect(client.billing.balance("app_001")).resolves.toMatchObject({ available_cents: 100000 });
    await expect(client.billing.records("app_001", 1, 20)).resolves.toMatchObject({ total: 1 });
  });

  it("raises APIError and handles http errors", async () => {
    const apiBaseURL = await startServer(() => ({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 1001, message: "invalid key_id", request_id: "err-rid", data: null }),
    }));
    const apiClient = new EasyID(keyId, secret, { baseURL: apiBaseURL });
    await expect(apiClient.phone.status("13800138000")).rejects.toBeInstanceOf(APIError);

    const htmlBaseURL = await startServer(() => ({
      status: 503,
      contentType: "text/html",
      body: "<html>503 Service Unavailable</html>",
    }));
    const htmlClient = new EasyID(keyId, secret, { baseURL: htmlBaseURL });
    await expect(htmlClient.phone.status("13800138000")).rejects.not.toBeInstanceOf(APIError);

    const jsonBaseURL = await startServer(() => ({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ code: 5000, message: "internal server error", request_id: "err-500", data: null }),
    }));
    const jsonClient = new EasyID(keyId, secret, { baseURL: jsonBaseURL });
    await expect(jsonClient.phone.status("13800138000")).rejects.toMatchObject({ code: 5000 });
  });

  it("validates keyId, secret, user-agent, and helper guards", async () => {
    expect(() => new EasyID("", secret)).toThrow();
    expect(() => new EasyID("sk_abc", secret)).toThrow();
    expect(() => new EasyID("ak_test", secret)).toThrow();
    expect(() => new EasyID("ak_UPPERCASE", secret)).toThrow();
    expect(() => new EasyID(keyId, "")).toThrow();
    expect(isAPIError(new APIError(1, "x", "r"))).toBe(true);

    const baseURL = await startServer((request) => {
      expect(request.headers["user-agent"]).toMatch(/^easyid-node\//);
      return { status: 200, contentType: "application/json", body: ok({ status: "real", carrier: "", province: "", roaming: false }) };
    });
    const client = new EasyID(keyId, secret, { baseURL });
    await client.phone.status("13800138000");
  });
});
