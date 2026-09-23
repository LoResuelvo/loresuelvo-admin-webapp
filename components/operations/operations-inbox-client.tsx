"use client";

import { useCallback, useEffect, useState } from "react";
import type { OperationSummary } from "@/domain/operations/operation-summary";
import type { OperationFilters } from "@/ports/operations/operation-repository";
import { translations } from "@/infrastructure/i18n/translations";
import { getOperationsAction } from "@/app/(dashboard)/operaciones/actions";
import { OperationsTable } from "./operations-table";
import { OperationsSkeleton } from "./operations-skeleton";
import { OperationsEmptyState } from "./operations-empty-state";

export interface OperationsInboxClientProps {
  initialFilters?: OperationFilters;
}

function useOperations(initialFilters?: OperationFilters) {
  const [operations, setOperations] = useState<OperationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getOperationsAction(initialFilters);
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
  }, [initialFilters]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  return { operations, isLoading, error, retry: loadOperations };
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

export function OperationsInboxClient({ initialFilters }: OperationsInboxClientProps) {
  const { operations, isLoading, error, retry } = useOperations(initialFilters);

  if (isLoading) return <OperationsSkeleton />;
  if (error) return <OperationsError error={error} onRetry={retry} />;
  if (operations.length === 0) return <OperationsEmptyState />;

  return <OperationsTable operations={operations} />;
}
