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
    void loadCategories();
  };

  const handleUpdate = async (id: number, name: string, expectedVersion: number) => {
    const res = await updateCategoryAction(id, name, expectedVersion);
    if (!res.success) throw new Error(res.error);
    setCategories((prev) => sortCategories(prev.map((c) => (c.id === id ? res.data : c))));
  };

  const handleGetImpact = async (id: number) => {
    const res = await getCategoryImpactAction(id);
    if (!res.success) throw new Error(res.error);
    return res.data;
  };

  const handleDeactivate = async (
    id: number,
    expectedVersion: number,
    confirmOngoingOrders: boolean,
  ) => {
    const res = await deactivateCategoryAction(id, expectedVersion, confirmOngoingOrders);
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

