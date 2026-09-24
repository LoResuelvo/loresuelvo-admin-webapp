import { describe, expect, it, vi } from "vitest";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import { getCategoryImpact } from "./get-category-impact";

describe("getCategoryImpact", () => {
  const mockImpact = {
    categoryId: 1,
    categoryName: "Cerrajería",
    providerCount: 3,
    activeOrdersCount: 0,
    canDeactivate: true,
  };

  it("delegates to categoryRepository.getImpact with token and id", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getImpact: vi.fn().mockResolvedValue(mockImpact),
      deactivate: vi.fn(),
    };

    const result = await getCategoryImpact("test-token", mockRepo, 1);

    expect(mockRepo.getImpact).toHaveBeenCalledWith("test-token", 1);
    expect(result).toEqual(mockImpact);
  });

  it("supports reverse parameter order (repo, token, id)", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getImpact: vi.fn().mockResolvedValue(mockImpact),
      deactivate: vi.fn(),
    };

    const result = await getCategoryImpact(mockRepo, "test-token", 1);

    expect(mockRepo.getImpact).toHaveBeenCalledWith("test-token", 1);
    expect(result).toEqual(mockImpact);
  });
});
