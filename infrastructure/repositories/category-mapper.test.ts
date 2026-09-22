import { describe, expect, it } from "vitest";
import { mapCategories, mapCategory, mapCreatedCategory } from "./category-mapper";

describe("category-mapper", () => {
  it("maps valid category DTO excluding additional properties", () => {
    const dto = { id: 1, name: "Electricidad", extra: "ignore-me" };
    expect(mapCategory(dto)).toEqual({ id: 1, name: "Electricidad" });
  });

  it("rejects invalid category DTOs", () => {
    expect(() => mapCategory(null)).toThrow("Invalid category data");
    expect(() => mapCategory({})).toThrow("Invalid category data");
    expect(() => mapCategory({ id: -1, name: "Test" })).toThrow("Invalid category data");
    expect(() => mapCategory({ id: 1, name: "" })).toThrow("Invalid category data");
  });

  it("maps created category DTO excluding normalized_name and additional fields", () => {
    const dto = { id: 1, name: "Plomería", normalized_name: "plomeria", extra: true };
    expect(mapCreatedCategory(dto)).toEqual({ id: 1, name: "Plomería" });
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
      { id: 1, name: "Albañilería" },
      { id: 2, name: "Electricidad" },
      { id: 3, name: "Plomería" },
    ]);
  });

  it("rejects invalid categories list data", () => {
    expect(() => mapCategories("invalid")).toThrow("Invalid categories list data");
    expect(() => mapCategories([{ id: "not-a-number", name: "Test" }])).toThrow(
      "Invalid categories list data",
    );
  });
});

