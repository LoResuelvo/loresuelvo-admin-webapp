export type AuditErrorCode = "forbidden" | "unavailable" | "unknown";

export class AuditError extends Error {
  constructor(readonly code: AuditErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AuditError";
  }
}
