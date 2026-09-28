export type ClaimErrorCode = "forbidden" | "unavailable" | "notFound" | "unknown";

export class ClaimError extends Error {
  constructor(readonly code: ClaimErrorCode, message?: string) {
    super(message ?? code);
    this.name = "ClaimError";
  }
}
