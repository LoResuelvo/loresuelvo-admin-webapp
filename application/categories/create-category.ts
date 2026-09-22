import type { Category } from "@/domain/categories/category";
import type { CategoryRepository } from "@/ports/categories/category-repository";

export async function createCategory(
  token: string,
  categoryRepository: CategoryRepository,
  name: string,
): Promise<Category>;
export async function createCategory(
  categoryRepository: CategoryRepository,
  token: string,
  name: string,
): Promise<Category>;
export async function createCategory(
  first: string | CategoryRepository,
  second: string | CategoryRepository,
  name: string,
): Promise<Category> {
  if (typeof first === "string") {
    const token = first;
    const repo = second as CategoryRepository;
    return repo.create(token, name);
  }
  const repo = first;
  const token = second as string;
  return repo.create(token, name);
}
