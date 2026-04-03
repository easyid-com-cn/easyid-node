import { BankService } from "./bank.js";
import { BillingService } from "./billing.js";
import { FaceService } from "./face.js";
import { IDCardService } from "./idcard.js";
import { PhoneService } from "./phone.js";
import { RiskService } from "./risk.js";
import { DEFAULT_BASE_URL, Transport, VERSION } from "./transport.js";
import type { EasyIDOptions } from "./types.js";

const KEY_ID_RE = /^ak_[0-9a-zA-Z_]+$/;

export class EasyID {
  static readonly version = VERSION;

  readonly idcard: IDCardService;
  readonly phone: PhoneService;
  readonly face: FaceService;
  readonly bank: BankService;
  readonly risk: RiskService;
  readonly billing: BillingService;

  constructor(keyId: string, secret: string, options: EasyIDOptions = {}) {
    if (!KEY_ID_RE.test(keyId)) {
      throw new TypeError(`easyid: keyId must match ak_<hex>, got: ${keyId}`);
    }
    if (!secret) {
      throw new TypeError("easyid: secret must not be empty");
    }
    const transport = new Transport(keyId, secret, {
      baseURL: options.baseURL ?? DEFAULT_BASE_URL,
      timeoutMs: options.timeoutMs,
      fetchImpl: options.fetchImpl,
    });
    this.idcard = new IDCardService(transport);
    this.phone = new PhoneService(transport);
    this.face = new FaceService(transport);
    this.bank = new BankService(transport);
    this.risk = new RiskService(transport);
    this.billing = new BillingService(transport);
  }
}
