import { createHmac } from "node:crypto";

export const sign = (
  secret: string,
  timestamp: string,
  query: Record<string, string> | undefined,
  body: Uint8Array,
): string => {
  const payloadParts: string[] = [];
  if (query) {
    for (const key of Object.keys(query).sort()) {
      payloadParts.push(`${key}=${query[key]}`);
    }
  }
  let payload = payloadParts.join("&");
  if (body.length > 0) {
    const bodyText = Buffer.from(body).toString("utf8");
    payload = payload ? `${payload}&${bodyText}` : bodyText;
  }
  const toSign = `${timestamp}\n${payload}`;
  return createHmac("sha256", secret).update(toSign).digest("hex");
};
