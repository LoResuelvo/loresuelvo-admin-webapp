export type OperationErrorCode = "forbidden" | "unavailable" | "not_found" | "unknown";

export class OperationError extends Error {
  constructor(readonly code: OperationErrorCode, message?: string) {
    super(message ?? code);
    this.name = "OperationError";
  }
}
