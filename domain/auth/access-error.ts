export class AccessError extends Error {
  constructor(readonly code: "unauthenticated" | "sessionExpired" | "forbidden" | "notProvisioned" | "unavailable") {
    super(code);
    this.name = "AccessError";
  }
}
