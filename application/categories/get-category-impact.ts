import type { CategoryImpact } from "@/domain/categories/category-impact";
import type { CategoryRepository } from "@/ports/categories/category-repository";

export async function getCategoryImpact(
  token: string,
  categoryRepository: CategoryRepository,
  id: number,
): Promise<CategoryImpact>;
export async function getCategoryImpact(
  categoryRepository: CategoryRepository,
  token: string,
  id: number,
): Promise<CategoryImpact>;
export async function getCategoryImpact(
  first: string | CategoryRepository,
  second: string | CategoryRepository,
  id: number,
): Promise<CategoryImpact> {
  if (typeof first === "string") {
    const token = first;
    const repo = second as CategoryRepository;
    return repo.getImpact(token, id);
  }

  const repo = first;
  const token = second as string;
  return repo.getImpact(token, id);
}
