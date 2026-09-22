import type { Category } from "@/domain/categories/category";

export interface CategoryRepository {
  getAll(token: string): Promise<Category[]>;
}
