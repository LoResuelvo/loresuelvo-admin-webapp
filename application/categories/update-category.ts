import type { Category } from "@/domain/categories/category";
import type { CategoryRepository } from "@/ports/categories/category-repository";

export async function updateCategory(
  token: string,
  categoryRepository: CategoryRepository,
  id: number,
  name: string,
  expectedVersion: number,
): Promise<Category>;
export async function updateCategory(
  categoryRepository: CategoryRepository,
  token: string,
  id: number,
  name: string,
  expectedVersion: number,
): Promise<Category>;
export async function updateCategory(
  first: string | CategoryRepository,
  second: string | CategoryRepository,
  id: number,
  name: string,
  expectedVersion: number,
): Promise<Category> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("El nombre es obligatorio");
  }

  if (typeof first === "string") {
    const token = first;
    const repo = second as CategoryRepository;
    return repo.update(token, id, trimmed, expectedVersion);
  }

  const repo = first;
  const token = second as string;
  return repo.update(token, id, trimmed, expectedVersion);
}
