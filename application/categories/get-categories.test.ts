import { describe, expect, it, vi } from "vitest";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import { getCategories } from "./get-categories";

describe("getCategories usecase", () => {
  it("delegates to categoryRepository and returns categories", async () => {
    const categories = [
      { id: 1, name: "Albañilería" },
      { id: 2, name: "Electricidad" },
    ];
    const mockRepo: CategoryRepository = {
      getAll: vi.fn().mockResolvedValue(categories),
    };

    const result = await getCategories(mockRepo, "valid-token");

    expect(mockRepo.getAll).toHaveBeenCalledWith("valid-token");
    expect(result).toEqual(categories);
  });

  it("propagates repository errors", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn().mockRejectedValue(new Error("Network failure")),
    };

    await expect(getCategories(mockRepo, "token")).rejects.toThrow("Network failure");
  });
});
