export type ReviewErrorCode = "forbidden" | "unavailable" | "unknown" | "notFound";

export class ReviewError extends Error {
  constructor(
    public readonly code: ReviewErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ReviewError";
  }
}
