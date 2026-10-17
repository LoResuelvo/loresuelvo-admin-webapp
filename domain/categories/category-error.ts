export type CategoryErrorCode =
  | "duplicate"
  | "conflict"
  | "confirmationRequired"
  | "invalid"
  | "notFound"
  | "forbidden"
  | "unavailable";

export class CategoryError extends Error {
  constructor(readonly code: CategoryErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CategoryError";
  }
}
