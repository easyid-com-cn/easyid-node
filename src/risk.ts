import type { RiskScoreRequest, RiskScoreResult, StoreFingerprintRequest, StoreFingerprintResult } from "./types.js";
import { Transport } from "./transport.js";

export class RiskService {
  constructor(private readonly transport: Transport) {}

  score(request: RiskScoreRequest): Promise<RiskScoreResult> {
    return this.transport.requestJSON("POST", "/v1/risk/score", undefined, {
      ...(request.ip ? { ip: request.ip } : {}),
      ...(request.deviceFingerprint ? { device_fingerprint: request.deviceFingerprint } : {}),
      ...(request.deviceId ? { device_id: request.deviceId } : {}),
      ...(request.phone ? { phone: request.phone } : {}),
      ...(request.email ? { email: request.email } : {}),
      ...(request.userAgent ? { user_agent: request.userAgent } : {}),
      ...(request.action ? { action: request.action } : {}),
      ...(request.amount !== undefined ? { amount: request.amount } : {}),
      ...(request.context ? { context: request.context } : {}),
    });
  }

  storeFingerprint(request: StoreFingerprintRequest): Promise<StoreFingerprintResult> {
    return this.transport.requestJSON("POST", "/v1/device/fingerprint", undefined, {
      device_id: request.deviceId,
      fingerprint: request.fingerprint,
    });
  }
}
