"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/domain/categories/category";
import { translations } from "@/infrastructure/i18n/translations";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  getCategoryImpactAction,
  deactivateCategoryAction,
} from "./actions";

function sortCategories(list: Category[]): Category[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function useRubrosPageState() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCategoriesAction();
      if (result.success) setCategories(result.data);
      else setError(translations.categories.error);
    } catch {
      setError(translations.categories.error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (name: string) => {
    const res = await createCategoryAction(name);
    if (!res.success) throw new Error(res.error);
    setCategories((prev) => sortCategories([...prev, res.data]));
  };

  const handleUpdate = async (id: number, name: string) => {
    const res = await updateCategoryAction(id, name);
    if (!res.success) throw new Error(res.error);
    setCategories((prev) => sortCategories(prev.map((c) => (c.id === id ? res.data : c))));
  };

  const handleGetImpact = async (id: number) => {
    const res = await getCategoryImpactAction(id);
    if (!res.success) throw new Error(res.error);
    return res.data;
  };

  const handleDeactivate = async (id: number) => {
    const res = await deactivateCategoryAction(id);
    if (!res.success) throw new Error(res.error);
    setCategories((prev) => sortCategories(prev.map((c) => (c.id === id ? res.data : c))));
  };

  return {
    categories,
    isLoading,
    error,
    onRetry: loadCategories,
    onCreateCategory: handleCreate,
    onUpdateCategory: handleUpdate,
    onGetImpact: handleGetImpact,
    onDeactivateCategory: handleDeactivate,
  };
}

