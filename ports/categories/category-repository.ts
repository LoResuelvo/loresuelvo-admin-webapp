import type { Category } from "@/domain/categories/category";

export interface CategoryRepository {
  getAll(token: string): Promise<Category[]>;
  create?(token: string, name: string): Promise<Category>;
}
