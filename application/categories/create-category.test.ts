import { describe, expect, it, vi } from "vitest";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import { createCategory } from "./create-category";

describe("createCategory usecase", () => {
  it("delegates to categoryRepository and returns created category (token, repo, name)", async () => {
    const createdCategory = { id: 10, name: "Plomería" };
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn().mockResolvedValue(createdCategory),
      update: vi.fn(),
    };

    const result = await createCategory("valid-token", mockRepo, "Plomería");

    expect(mockRepo.create).toHaveBeenCalledWith("valid-token", "Plomería");
    expect(result).toEqual(createdCategory);
  });

  it("supports (repo, token, name) signature", async () => {
    const createdCategory = { id: 10, name: "Plomería" };
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn().mockResolvedValue(createdCategory),
      update: vi.fn(),
    };

    const result = await createCategory(mockRepo, "valid-token", "Plomería");

    expect(mockRepo.create).toHaveBeenCalledWith("valid-token", "Plomería");
    expect(result).toEqual(createdCategory);
  });

  it("propagates repository errors", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn().mockRejectedValue(new Error("Conflict: already exists")),
      update: vi.fn(),
    };

    await expect(createCategory("valid-token", mockRepo, "Plomería")).rejects.toThrow(
      "Conflict: already exists",
    );
  });
});
