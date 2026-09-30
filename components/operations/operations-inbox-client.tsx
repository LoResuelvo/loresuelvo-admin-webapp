"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { OperationSummary, BottleneckType } from "@/domain/operations/operation-summary";
import type { OperationFilters } from "@/ports/operations/operation-repository";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
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
  const generation = useRef(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [operations, setOperations] = useState<OperationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const loadOperations = useCallback(async () => {
    const request = ++generation.current;
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);
    try {
      const result = await getOperationsAction(filters);
      if (request !== generation.current) return;
      if (result.success) {
        setOperations(result.data.operations);
        setNextCursor(result.data.nextCursor);
      } else {
        if (result.isForbidden) {
          setIsForbidden(true);
        }
        setError(result.error);
      }
    } catch {
      if (request === generation.current) setError(translations.operations.error);
    } finally {
      if (request === generation.current) setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOperations();
    return () => { generation.current++; };
  }, [loadOperations]);

  return { operations, nextCursor, isLoading, error, isForbidden, retry: loadOperations };
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

function OperationsForbidden({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{message}</p>
    </div>
  );
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

function useOperationFilters(initialFilters?: OperationFilters) {
  const [filters, setFilters] = useState<OperationFilters>(initialFilters ?? {});

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      q: query || undefined,
    }));
  };

  const handleCategoryChange = (categoryId: number | "") => {
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    }));
  };

  const handleBottleneckChange = (bottleneck: BottleneckType | "") => {
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      bottleneck: bottleneck || undefined,
    }));
  };

  return {
    filters,
    handleSearchChange,
    handleCategoryChange,
    handleBottleneckChange,
    setFilters,
  };
}

export function OperationsInboxClient({
  initialFilters,
  initialCategories,
}: OperationsInboxClientProps) {
  const router = useRouter();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const { filters, handleSearchChange, handleCategoryChange, handleBottleneckChange, setFilters } =
    useOperationFilters(initialFilters);
  const { operations, nextCursor, isLoading, error, isForbidden, retry } = useOperations(filters);
  const categories = useCategories(initialCategories);
  useEffect(() => { setCursorHistory([]); }, [filters.q, filters.categoryId, filters.bottleneck]);

  if (isLoading && operations.length === 0) return <OperationsSkeleton />;
  if (isForbidden) return <OperationsForbidden message={error ?? translations.operations.forbidden} />;
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
        <OperationsTable
          operations={operations}
          onSelectOperation={(op) => router.push(ROUTES.operationDetail(op.id))}
        />
      )}
      <nav aria-label={translations.operations.table.caption} className="flex gap-3">
        <button type="button" disabled={isLoading || cursorHistory.length === 0} onClick={() => {
          const previous = cursorHistory.at(-1);
          setCursorHistory(history => history.slice(0, -1));
          setFilters(current => ({ ...current, cursor: previous }));
        }}>{translations.operations.previousPage}</button>
        <button type="button" disabled={isLoading || !nextCursor} onClick={() => {
          setCursorHistory(history => [...history, filters.cursor]);
          setFilters(current => ({ ...current, cursor: nextCursor ?? undefined }));
        }}>{translations.operations.nextPage}</button>
      </nav>
    </div>
  );
}


