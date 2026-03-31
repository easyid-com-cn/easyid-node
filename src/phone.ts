import type { PhoneStatusResult, PhoneVerify3Request, PhoneVerify3Result } from "./types.js";
import { Transport } from "./transport.js";

export class PhoneService {
  constructor(private readonly transport: Transport) {}

  status(phone: string): Promise<PhoneStatusResult> {
    return this.transport.requestJSON("GET", "/v1/phone/status", { phone });
  }

  verify3(request: PhoneVerify3Request): Promise<PhoneVerify3Result> {
    return this.transport.requestJSON("POST", "/v1/phone/verify3", undefined, {
      name: request.name,
      id_number: request.idNumber,
      mobile: request.mobile,
    });
  }
}
