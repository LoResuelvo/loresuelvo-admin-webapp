export type MetricErrorCode = "forbidden" | "unavailable" | "unknown";

export class MetricError extends Error {
  constructor(
    public readonly code: MetricErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "MetricError";
  }
}
