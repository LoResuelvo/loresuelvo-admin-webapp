export type CategoryErrorCode = "duplicate" | "forbidden" | "unavailable";

export class CategoryError extends Error {
  constructor(readonly code: CategoryErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CategoryError";
  }
}
