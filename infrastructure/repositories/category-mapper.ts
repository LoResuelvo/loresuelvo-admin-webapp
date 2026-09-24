import type { Category } from "@/domain/categories/category";
import type { CategoryImpact } from "@/domain/categories/category-impact";
import {
  apiCategoriesListSchema,
  apiCategoryImpactResponseSchema,
  apiCategoryListItemSchema,
  apiCreateCategoryResponseSchema,
} from "@/infrastructure/api/types";

export function mapCategory(value: unknown): Category {
  const parsed = apiCategoryListItemSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid category data");
  }
  return {
    id: parsed.data.id,
    name: parsed.data.name,
    enabled: parsed.data.enabled ?? true,
  };
}

export function mapCreatedCategory(value: unknown): Category {
  const parsed = apiCreateCategoryResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid created category data");
  }
  return { id: parsed.data.id, name: parsed.data.name, enabled: true };
}

export function mapCategories(value: unknown): Category[] {
  const parsed = apiCategoriesListSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid categories list data");
  }
  return [...parsed.data]
    .map((item) => ({
      id: item.id,
      name: item.name,
      enabled: item.enabled ?? true,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function mapCategoryImpact(value: unknown): CategoryImpact {
  const parsed = apiCategoryImpactResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid category impact data");
  }
  const data = parsed.data;
  const categoryId = data.categoryId ?? data.category_id;
  const categoryName = data.categoryName ?? data.category_name;
  if (!categoryId || !categoryName) {
    throw new Error("Invalid category impact data");
  }
  const providerCount = data.providerCount ?? data.provider_count ?? 0;
  const activeOrdersCount = data.activeOrdersCount ?? data.active_orders_count ?? 0;
  const canDeactivate = data.canDeactivate ?? data.can_deactivate ?? activeOrdersCount === 0;

  return {
    categoryId,
    categoryName,
    providerCount,
    activeOrdersCount,
    canDeactivate,
  };
}


