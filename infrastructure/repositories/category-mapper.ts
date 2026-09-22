import type { Category } from "@/domain/categories/category";
import { apiCategoriesListSchema, apiCategoryListItemSchema } from "@/infrastructure/api/types";

export function mapCategory(value: unknown): Category {
  const parsed = apiCategoryListItemSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid category data");
  }
  return { id: parsed.data.id, name: parsed.data.name };
}

export function mapCategories(value: unknown): Category[] {
  const parsed = apiCategoriesListSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid categories list data");
  }
  return [...parsed.data]
    .map((item) => ({ id: item.id, name: item.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
