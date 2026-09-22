"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/domain/categories/category";
import { CategoriesPage } from "@/components/categories/categories-page";
import { translations } from "@/infrastructure/i18n/translations";
import { getCategoriesAction } from "./actions";

export default function RubrosPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCategoriesAction();
      if (result.success) {
        setCategories(result.data);
      } else {
        setError(translations.categories.error);
      }
    } catch {
      setError(translations.categories.error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <CategoriesPage
      categories={categories}
      isLoading={isLoading}
      error={error}
      onRetry={loadCategories}
    />
  );
}
