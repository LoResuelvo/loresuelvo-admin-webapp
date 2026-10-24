import type { Category } from "@/domain/categories/category";
import type { CategoryImpact } from "@/domain/categories/category-impact";

export interface CategoryRepository {
  getAll(token: string): Promise<Category[]>;
  create(token: string, name: string): Promise<Category>;
  update(token: string, id: number, name: string, expectedVersion: number): Promise<Category>;
  getImpact(token: string, id: number): Promise<CategoryImpact>;
  deactivate(
    token: string,
    id: number,
    expectedVersion: number,
    confirmOngoingOrders: boolean,
  ): Promise<Category>;
}


