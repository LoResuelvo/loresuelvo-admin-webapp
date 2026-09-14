export class AccessError extends Error {
  constructor(readonly code: "unauthenticated" | "sessionExpired" | "forbidden" | "unavailable") {
    super(code);
    this.name = "AccessError";
  }
}
