export type UserErrorCode = "forbidden" | "unavailable";

export class UserError extends Error {
  constructor(readonly code: UserErrorCode, message?: string) {
    super(message ?? code);
    this.name = "UserError";
  }
}
