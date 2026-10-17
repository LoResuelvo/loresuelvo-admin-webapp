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
    enabled: parsed.data.enabled,
    version: parsed.data.version,
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
      enabled: item.enabled,
      version: item.version,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function mapCategoryImpact(value: unknown): CategoryImpact {
  const parsed = apiCategoryImpactResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid category impact data");
  }
  const { category, counts } = parsed.data;
  const activeOrdersCount = counts.scheduled_orders + counts.awaiting_payment_orders;

  return {
    categoryId: category.id,
    categoryName: category.name,
    observedAt: parsed.data.observed_at,
    counts: {
      assignedProviders: counts.assigned_providers,
      pendingRequests: counts.pending_requests,
      acceptedRequestsWithoutProposal: counts.accepted_requests_without_proposal,
      pendingProposals: counts.pending_proposals,
      scheduledOrders: counts.scheduled_orders,
      awaitingPaymentOrders: counts.awaiting_payment_orders,
    },
    hasOngoingOrders: parsed.data.has_ongoing_orders,
    requiresConfirmation: parsed.data.requires_confirmation,
    existingOperationsCanContinue: parsed.data.existing_operations_can_continue,
    providerCount: counts.assigned_providers,
    activeOrdersCount,
  };
}


