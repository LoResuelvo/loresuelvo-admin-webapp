export type UserErrorCode = "forbidden" | "unavailable" | "not_found";

export class UserError extends Error {
  constructor(readonly code: UserErrorCode, message?: string) {
    super(message ?? code);
    this.name = "UserError";
  }
}
