import type { Category } from "@/domain/categories/category";
import type { CategoryRepository } from "@/ports/categories/category-repository";

export async function deactivateCategory(
  token: string,
  categoryRepository: CategoryRepository,
  id: number,
  expectedVersion: number,
  reason: string,
  confirmOngoingOrders: boolean,
): Promise<Category>;
export async function deactivateCategory(
  categoryRepository: CategoryRepository,
  token: string,
  id: number,
  expectedVersion: number,
  reason: string,
  confirmOngoingOrders: boolean,
): Promise<Category>;
export async function deactivateCategory(
  first: string | CategoryRepository,
  second: string | CategoryRepository,
  id: number,
  expectedVersion: number,
  reason: string,
  confirmOngoingOrders: boolean,
): Promise<Category> {
  if (typeof first === "string") {
    const token = first;
    const repo = second as CategoryRepository;
    return repo.deactivate(token, id, expectedVersion, reason, confirmOngoingOrders);
  }

  const repo = first;
  const token = second as string;
  return repo.deactivate(token, id, expectedVersion, reason, confirmOngoingOrders);
}
