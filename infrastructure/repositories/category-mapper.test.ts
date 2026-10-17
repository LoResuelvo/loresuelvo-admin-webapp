import { describe, expect, it } from "vitest";
import {
  mapCategories,
  mapCategory,
  mapCategoryImpact,
  mapCreatedCategory,
} from "./category-mapper";

describe("category-mapper", () => {
  it("maps administrative category DTO excluding additional properties", () => {
    const dto = { id: 1, name: "Electricidad", enabled: true, version: 4, extra: "ignore-me" };
    expect(mapCategory(dto)).toEqual({ id: 1, name: "Electricidad", enabled: true, version: 4 });
  });

  it("maps category DTO with explicit enabled flag", () => {
    const dto = { id: 1, name: "Electricidad", enabled: false, version: 5 };
    expect(mapCategory(dto)).toEqual({ id: 1, name: "Electricidad", enabled: false, version: 5 });
  });

  it("rejects invalid category DTOs", () => {
    expect(() => mapCategory(null)).toThrow("Invalid category data");
    expect(() => mapCategory({})).toThrow("Invalid category data");
    expect(() => mapCategory({ id: -1, name: "Test", enabled: true, version: 1 })).toThrow("Invalid category data");
    expect(() => mapCategory({ id: 1, name: "", enabled: true, version: 1 })).toThrow("Invalid category data");
    expect(() => mapCategory({ id: 1, name: "Test", enabled: true })).toThrow("Invalid category data");
  });

  it("maps created category DTO excluding normalized_name and additional fields", () => {
    const dto = { id: 1, name: "Plomería", normalized_name: "plomeria", extra: true };
    expect(mapCreatedCategory(dto)).toEqual({ id: 1, name: "Plomería", enabled: true });
  });

  it("rejects invalid created category DTOs", () => {
    expect(() => mapCreatedCategory(null)).toThrow("Invalid created category data");
    expect(() => mapCreatedCategory({})).toThrow("Invalid created category data");
    expect(() => mapCreatedCategory({ id: 0, name: "Test" })).toThrow("Invalid created category data");
    expect(() => mapCreatedCategory({ id: 1, name: "   " })).toThrow("Invalid created category data");
  });

  it("maps category list and sorts them alphabetically by name in Spanish", () => {
    const listDto = [
      { id: 3, name: "Plomería", enabled: true, version: 2, extra: 123 },
      { id: 1, name: "Albañilería", enabled: true, version: 1 },
      { id: 2, name: "Electricidad", enabled: false, version: 3 },
    ];
    const result = mapCategories(listDto);
    expect(result).toEqual([
      { id: 1, name: "Albañilería", enabled: true, version: 1 },
      { id: 2, name: "Electricidad", enabled: false, version: 3 },
      { id: 3, name: "Plomería", enabled: true, version: 2 },
    ]);
  });

  it("rejects invalid categories list data", () => {
    expect(() => mapCategories("invalid")).toThrow("Invalid categories list data");
    expect(() => mapCategories([{ id: "not-a-number", name: "Test" }])).toThrow(
      "Invalid categories list data",
    );
  });

  it("maps the nested category impact response and preserves all counters", () => {
    const impactDto = {
      category: { id: 1, name: "Cerrajería", enabled: true, version: 2 },
      observed_at: "2026-10-15T12:00:00Z",
      counts: {
        assigned_providers: 4,
        pending_requests: 1,
        accepted_requests_without_proposal: 2,
        pending_proposals: 3,
        scheduled_orders: 0,
        awaiting_payment_orders: 0,
      },
      has_ongoing_orders: false,
      requires_confirmation: false,
      existing_operations_can_continue: true,
    };
    expect(mapCategoryImpact(impactDto)).toEqual({
      categoryId: 1,
      categoryName: "Cerrajería",
      observedAt: "2026-10-15T12:00:00Z",
      counts: {
        assignedProviders: 4,
        pendingRequests: 1,
        acceptedRequestsWithoutProposal: 2,
        pendingProposals: 3,
        scheduledOrders: 0,
        awaitingPaymentOrders: 0,
      },
      hasOngoingOrders: false,
      requiresConfirmation: false,
      existingOperationsCanContinue: true,
      providerCount: 4,
      activeOrdersCount: 0,
    });
  });

  it("maps ongoing order counts that require explicit confirmation", () => {
    const impactDto = {
      category: { id: 2, name: "Electricidad", enabled: true, version: 8 },
      observed_at: "2026-10-15T12:00:00Z",
      counts: {
        assigned_providers: 5,
        pending_requests: 0,
        accepted_requests_without_proposal: 1,
        pending_proposals: 1,
        scheduled_orders: 2,
        awaiting_payment_orders: 1,
      },
      has_ongoing_orders: true,
      requires_confirmation: true,
      existing_operations_can_continue: true,
    };
    expect(mapCategoryImpact(impactDto)).toEqual({
      categoryId: 2,
      categoryName: "Electricidad",
      observedAt: "2026-10-15T12:00:00Z",
      counts: {
        assignedProviders: 5,
        pendingRequests: 0,
        acceptedRequestsWithoutProposal: 1,
        pendingProposals: 1,
        scheduledOrders: 2,
        awaitingPaymentOrders: 1,
      },
      hasOngoingOrders: true,
      requiresConfirmation: true,
      existingOperationsCanContinue: true,
      providerCount: 5,
      activeOrdersCount: 3,
    });
  });

  it("rejects invalid category impact DTOs", () => {
    expect(() => mapCategoryImpact(null)).toThrow("Invalid category impact data");
    expect(() => mapCategoryImpact({})).toThrow("Invalid category impact data");
    expect(() => mapCategoryImpact({ category: { id: -1, name: "Test", enabled: true, version: 1 } })).toThrow(
      "Invalid category impact data",
    );
  });
});


