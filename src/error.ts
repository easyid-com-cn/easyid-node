export class APIError extends Error {
  readonly code: number;
  readonly requestId: string;

  constructor(code: number, message: string, requestId: string) {
    super(`easyid: code=${code} message=${message} request_id=${requestId}`);
    this.name = "APIError";
    this.code = code;
    this.requestId = requestId;
  }
}

export const isAPIError = (error: unknown): error is APIError => error instanceof APIError;
