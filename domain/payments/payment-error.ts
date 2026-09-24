export type PaymentErrorCode = "forbidden" | "unavailable" | "notFound";

export class PaymentError extends Error {
  constructor(readonly code: PaymentErrorCode, message?: string) {
    super(message ?? code);
    this.name = "PaymentError";
  }
}
