import { describe, expect, it } from "vitest";
import {
  mapCategories,
  mapCategory,
  mapCategoryImpact,
  mapCreatedCategory,
} from "./category-mapper";

describe("category-mapper", () => {
  it("maps valid category DTO excluding additional properties", () => {
    const dto = { id: 1, name: "Electricidad", extra: "ignore-me" };
    expect(mapCategory(dto)).toEqual({ id: 1, name: "Electricidad", enabled: true });
  });

  it("maps category DTO with explicit enabled flag", () => {
    const dto = { id: 1, name: "Electricidad", enabled: false };
    expect(mapCategory(dto)).toEqual({ id: 1, name: "Electricidad", enabled: false });
  });

  it("rejects invalid category DTOs", () => {
    expect(() => mapCategory(null)).toThrow("Invalid category data");
    expect(() => mapCategory({})).toThrow("Invalid category data");
    expect(() => mapCategory({ id: -1, name: "Test" })).toThrow("Invalid category data");
    expect(() => mapCategory({ id: 1, name: "" })).toThrow("Invalid category data");
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
      { id: 3, name: "Plomería", extra: 123 },
      { id: 1, name: "Albañilería" },
      { id: 2, name: "Electricidad" },
    ];
    const result = mapCategories(listDto);
    expect(result).toEqual([
      { id: 1, name: "Albañilería", enabled: true },
      { id: 2, name: "Electricidad", enabled: true },
      { id: 3, name: "Plomería", enabled: true },
    ]);
  });

  it("rejects invalid categories list data", () => {
    expect(() => mapCategories("invalid")).toThrow("Invalid categories list data");
    expect(() => mapCategories([{ id: "not-a-number", name: "Test" }])).toThrow(
      "Invalid categories list data",
    );
  });

  it("maps category impact correctly with snake_case fields", () => {
    const impactDto = {
      category_id: 1,
      category_name: "Cerrajería",
      provider_count: 4,
      active_orders_count: 0,
      can_deactivate: true,
    };
    expect(mapCategoryImpact(impactDto)).toEqual({
      categoryId: 1,
      categoryName: "Cerrajería",
      providerCount: 4,
      activeOrdersCount: 0,
      canDeactivate: true,
    });
  });

  it("maps category impact with active orders and blocked deactivation", () => {
    const impactDto = {
      category_id: 2,
      category_name: "Electricidad",
      provider_count: 5,
      active_orders_count: 3,
      can_deactivate: false,
    };
    expect(mapCategoryImpact(impactDto)).toEqual({
      categoryId: 2,
      categoryName: "Electricidad",
      providerCount: 5,
      activeOrdersCount: 3,
      canDeactivate: false,
    });
  });

  it("rejects invalid category impact DTOs", () => {
    expect(() => mapCategoryImpact(null)).toThrow("Invalid category impact data");
    expect(() => mapCategoryImpact({})).toThrow("Invalid category impact data");
    expect(() => mapCategoryImpact({ category_id: -1, category_name: "Test" })).toThrow(
      "Invalid category impact data",
    );
  });
});


