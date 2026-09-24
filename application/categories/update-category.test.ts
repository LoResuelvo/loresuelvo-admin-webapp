import { describe, expect, it, vi } from "vitest";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import { updateCategory } from "./update-category";

describe("updateCategory usecase", () => {
  it("delegates to categoryRepository and returns updated category (token, repo, id, name)", async () => {
    const updatedCategory = { id: 1, name: "Instalaciones Sanitarias" };
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updatedCategory),
    };

    const result = await updateCategory("valid-token", mockRepo, 1, "Instalaciones Sanitarias");

    expect(mockRepo.update).toHaveBeenCalledWith("valid-token", 1, "Instalaciones Sanitarias");
    expect(result).toEqual(updatedCategory);
  });

  it("supports (repo, token, id, name) signature", async () => {
    const updatedCategory = { id: 1, name: "Instalaciones Sanitarias" };
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updatedCategory),
    };

    const result = await updateCategory(mockRepo, "valid-token", 1, "Instalaciones Sanitarias");

    expect(mockRepo.update).toHaveBeenCalledWith("valid-token", 1, "Instalaciones Sanitarias");
    expect(result).toEqual(updatedCategory);
  });

  it("validates required name and rejects empty or whitespace name", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    await expect(updateCategory("valid-token", mockRepo, 1, "")).rejects.toThrow(
      "El nombre es obligatorio",
    );
    await expect(updateCategory("valid-token", mockRepo, 1, "   ")).rejects.toThrow(
      "El nombre es obligatorio",
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("trims name before passing to repository", async () => {
    const updatedCategory = { id: 1, name: "Instalaciones Sanitarias" };
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updatedCategory),
    };

    await updateCategory("valid-token", mockRepo, 1, "  Instalaciones Sanitarias  ");

    expect(mockRepo.update).toHaveBeenCalledWith("valid-token", 1, "Instalaciones Sanitarias");
  });

  it("propagates repository errors", async () => {
    const mockRepo: CategoryRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockRejectedValue(new Error("Conflict: already exists")),
    };

    await expect(updateCategory("valid-token", mockRepo, 1, "Plomería")).rejects.toThrow(
      "Conflict: already exists",
    );
  });
});
