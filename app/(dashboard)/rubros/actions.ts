"use server";

import type { Category } from "@/domain/categories/category";
import { getCategories } from "@/application/categories/get-categories";
import { createCategory } from "@/application/categories/create-category";
import { apiCategoryRepository } from "@/infrastructure/repositories/api-category-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { CategoryError } from "@/domain/categories/category-error";
import { translations } from "@/infrastructure/i18n/translations";

export type GetCategoriesResult =
  | { success: true; data: Category[] }
  | { success: false; error: string };

export type CreateCategoryResult =
  | { success: true; data: Category }
  | { success: false; error: string };

async function resolveAuthToken(): Promise<string> {
  try {
    return await authSession.getAccessToken();
  } catch {
    if (process.env.APP_ENV === "production") {
      throw new Error("unauthenticated");
    }
    return "mock-token";
  }
}

export async function getCategoriesAction(): Promise<GetCategoriesResult> {
  try {
    const token = await resolveAuthToken();
    const categories = await getCategories(apiCategoryRepository, token);
    return { success: true, data: categories };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener rubros";
    return { success: false, error: message };
  }
}

export async function createCategoryAction(name: string): Promise<CreateCategoryResult> {
  try {
    const token = await resolveAuthToken();
    const category = await createCategory(token, apiCategoryRepository, name);
    return { success: true, data: category };
  } catch (error: unknown) {
    if (error instanceof CategoryError) {
      if (error.code === "duplicate") {
        return { success: false, error: translations.categories.modal.errors.duplicate };
      }
      if (error.code === "forbidden") {
        return { success: false, error: translations.categories.modal.errors.forbidden };
      }
      if (error.code === "unavailable") {
        return { success: false, error: translations.categories.modal.errors.serverError };
      }
    }
    return { success: false, error: translations.categories.modal.errors.serverError };
  }
}

