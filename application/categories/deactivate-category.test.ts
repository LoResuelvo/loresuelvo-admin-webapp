import { describe, expect, it, vi } from "vitest";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import { deactivateCategory } from "./deactivate-category";

describe("deactivateCategory", () => {
  const mockDeactivatedCategory = {
    id: 1,
    name: "Cerrajería",
    enabled: false,
  };

  it("delegates to categoryRepository.deactivate with token and id", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getImpact: vi.fn(),
      deactivate: vi.fn().mockResolvedValue(mockDeactivatedCategory),
    };

    const result = await deactivateCategory("test-token", mockRepo, 1);

    expect(mockRepo.deactivate).toHaveBeenCalledWith("test-token", 1);
    expect(result).toEqual(mockDeactivatedCategory);
  });

  it("supports reverse parameter order (repo, token, id)", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getImpact: vi.fn(),
      deactivate: vi.fn().mockResolvedValue(mockDeactivatedCategory),
    };

    const result = await deactivateCategory(mockRepo, "test-token", 1);

    expect(mockRepo.deactivate).toHaveBeenCalledWith("test-token", 1);
    expect(result).toEqual(mockDeactivatedCategory);
  });
});
