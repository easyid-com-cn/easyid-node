import type { BillingBalanceResult, BillingRecordsResult } from "./types.js";
import { Transport } from "./transport.js";

export class BillingService {
  constructor(private readonly transport: Transport) {}

  balance(appId: string): Promise<BillingBalanceResult> {
    return this.transport.requestJSON("GET", "/v1/billing/balance", { app_id: appId });
  }

  records(appId: string, page = 1, pageSize = 20): Promise<BillingRecordsResult> {
    const normalizedPageSize = pageSize <= 0 ? 20 : Math.min(pageSize, 100);
    return this.transport.requestJSON("GET", "/v1/billing/records", {
      app_id: appId,
      page: String(page > 0 ? page : 1),
      page_size: String(normalizedPageSize),
    });
  }
}
