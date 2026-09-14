export class AccessError extends Error {
  constructor(readonly code: "unauthenticated" | "forbidden" | "unavailable") {
    super(code);
    this.name = "AccessError";
  }
}
