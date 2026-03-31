import type { CompareResult, FaceVerifyRequest, FaceVerifyResult, LivenessResult } from "./types.js";
import { Transport } from "./transport.js";

export class FaceService {
  constructor(private readonly transport: Transport) {}

  liveness(media: Uint8Array | string, mode?: "active" | "passive", filename = "media.bin"): Promise<LivenessResult> {
    return this.transport.requestMultipart(
      "/v1/face/liveness",
      mode ? { mode } : {},
      [{ fieldName: "media", data: media, filename }],
    );
  }

  compare(
    image1: Uint8Array | string,
    image2: Uint8Array | string,
    filename1 = "image1.bin",
    filename2 = "image2.bin",
  ): Promise<CompareResult> {
    return this.transport.requestMultipart("/v1/face/compare", {}, [
      { fieldName: "image1", data: image1, filename: filename1 },
      { fieldName: "image2", data: image2, filename: filename2 },
    ]);
  }

  verify(request: FaceVerifyRequest): Promise<FaceVerifyResult> {
    return this.transport.requestJSON("POST", "/v1/face/verify", undefined, {
      id_number: request.idNumber,
      ...(request.mediaKey ? { media_key: request.mediaKey } : {}),
      ...(request.callbackUrl ? { callback_url: request.callbackUrl } : {}),
    });
  }
}
