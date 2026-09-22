import type { Category } from "@/domain/categories/category";
import type { CategoryRepository } from "@/ports/categories/category-repository";

export async function getCategories(
  categoryRepository: CategoryRepository,
  token: string,
): Promise<Category[]> {
  return categoryRepository.getAll(token);
}
