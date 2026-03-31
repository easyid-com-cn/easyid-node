import type { IDCardOCRResult, IDCardVerify2Request, IDCardVerify3Request, IDCardVerifyResult } from "./types.js";
import { Transport } from "./transport.js";

export class IDCardService {
  constructor(private readonly transport: Transport) {}

  verify2(request: IDCardVerify2Request): Promise<IDCardVerifyResult> {
    return this.transport.requestJSON("POST", "/v1/idcard/verify2", undefined, {
      name: request.name,
      id_number: request.idNumber,
      ...(request.traceId ? { trace_id: request.traceId } : {}),
    });
  }

  verify3(request: IDCardVerify3Request): Promise<IDCardVerifyResult> {
    return this.transport.requestJSON("POST", "/v1/idcard/verify3", undefined, {
      name: request.name,
      id_number: request.idNumber,
      mobile: request.mobile,
      ...(request.traceId ? { trace_id: request.traceId } : {}),
    });
  }

  ocr(side: "front" | "back", image: Uint8Array | string, filename = "image.bin"): Promise<IDCardOCRResult> {
    return this.transport.requestMultipart("/v1/ocr/idcard", { side }, [{ fieldName: "image", data: image, filename }]);
  }
}
