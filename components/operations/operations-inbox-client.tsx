"use client";

import { useCallback, useEffect, useState } from "react";
import type { OperationSummary, BottleneckType } from "@/domain/operations/operation-summary";
import type { OperationFilters } from "@/ports/operations/operation-repository";
import { translations } from "@/infrastructure/i18n/translations";
import { getOperationsAction } from "@/app/(dashboard)/operaciones/actions";
import { getCategoriesAction } from "@/app/(dashboard)/rubros/actions";
import { OperationsTable } from "./operations-table";
import { OperationsSkeleton } from "./operations-skeleton";
import { OperationsEmptyState } from "./operations-empty-state";
import { OperationsFilterBar, type CategoryOption } from "./operations-filter-bar";

export interface OperationsInboxClientProps {
  initialFilters?: OperationFilters;
  initialCategories?: readonly CategoryOption[];
}

function useOperations(filters?: OperationFilters) {
  const [operations, setOperations] = useState<OperationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getOperationsAction(filters);
      if (result.success) {
        setOperations(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError(translations.operations.error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  return { operations, isLoading, error, retry: loadOperations };
}

function useCategories(initialCategories?: readonly CategoryOption[]) {
  const [categories, setCategories] = useState<readonly CategoryOption[]>(initialCategories ?? []);

  useEffect(() => {
    let isMounted = true;
    getCategoriesAction()
      .then((res) => {
        if (isMounted && res.success) {
          setCategories(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return categories;
}

function OperationsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <p className="font-medium">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {translations.operations.retry}
      </button>
    </div>
  );
}

export function OperationsInboxClient({
  initialFilters,
  initialCategories,
}: OperationsInboxClientProps) {
  const [filters, setFilters] = useState<OperationFilters>(initialFilters ?? {});
  const { operations, isLoading, error, retry } = useOperations(filters);
  const categories = useCategories(initialCategories);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      q: query || undefined,
    }));
  };

  const handleCategoryChange = (categoryId: number | "") => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId ? Number(categoryId) : undefined,
    }));
  };

  const handleBottleneckChange = (bottleneck: BottleneckType | "") => {
    setFilters((prev) => ({
      ...prev,
      bottleneck: bottleneck || undefined,
    }));
  };

  if (isLoading && operations.length === 0) return <OperationsSkeleton />;
  if (error) return <OperationsError error={error} onRetry={retry} />;

  return (
    <div className="space-y-6">
      <OperationsFilterBar
        searchQuery={filters.q ?? ""}
        onSearchChange={handleSearchChange}
        selectedCategoryId={filters.categoryId ?? ""}
        onCategoryChange={handleCategoryChange}
        categoryOptions={categories}
        selectedBottleneck={filters.bottleneck ?? ""}
        onBottleneckChange={handleBottleneckChange}
      />

      {isLoading ? (
        <OperationsSkeleton />
      ) : operations.length === 0 ? (
        <OperationsEmptyState />
      ) : (
        <OperationsTable operations={operations} />
      )}
    </div>
  );
}
