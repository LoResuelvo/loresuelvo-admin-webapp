export type OperationErrorCode = "forbidden" | "unavailable" | "unknown";

export class OperationError extends Error {
  constructor(readonly code: OperationErrorCode, message?: string) {
    super(message ?? code);
    this.name = "OperationError";
  }
}
