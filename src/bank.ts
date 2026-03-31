import type { BankVerify4Request, BankVerify4Result } from "./types.js";
import { Transport } from "./transport.js";

export class BankService {
  constructor(private readonly transport: Transport) {}

  verify4(request: BankVerify4Request): Promise<BankVerify4Result> {
    return this.transport.requestJSON("POST", "/v1/bank/verify4", undefined, {
      name: request.name,
      id_number: request.idNumber,
      bank_card: request.bankCard,
      ...(request.mobile ? { mobile: request.mobile } : {}),
      ...(request.traceId ? { trace_id: request.traceId } : {}),
    });
  }
}
