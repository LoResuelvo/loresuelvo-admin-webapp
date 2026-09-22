"use server";

import type { Category } from "@/domain/categories/category";
import { getCategories } from "@/application/categories/get-categories";
import { apiCategoryRepository } from "@/infrastructure/repositories/api-category-repository";
import { authSession } from "@/infrastructure/auth/auth-session";

export type GetCategoriesResult =
  | { success: true; data: Category[] }
  | { success: false; error: string };

export async function getCategoriesAction(): Promise<GetCategoriesResult> {
  try {
    let token = "";
    try {
      token = await authSession.getAccessToken();
    } catch {
      if (process.env.APP_ENV === "production") {
        throw new Error("unauthenticated");
      }
      token = "mock-token";
    }

    const categories = await getCategories(apiCategoryRepository, token);
    return { success: true, data: categories };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener rubros";
    return { success: false, error: message };
  }
}
