"use client";

import { useCallback, useEffect, useState } from "react";
import type { OperationSummary } from "@/domain/operations/operation-summary";
import type { OperationFilters } from "@/ports/operations/operation-repository";
import { translations } from "@/infrastructure/i18n/translations";
import { getOperationsAction } from "@/app/(dashboard)/operaciones/actions";
import { OperationsTable } from "./operations-table";

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

function OperationsLoading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-16 text-center">
      <span
        aria-hidden="true"
        className="mb-4 block size-8 rounded-full border-2 border-[#147560]/20 border-t-[#147560] motion-safe:animate-spin"
      />
      <p className="text-sm font-medium text-[#1A2B48]/70">
        {translations.operations.loading}
      </p>
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

function OperationsEmpty() {
  return (
    <div role="status" className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs">
      <p className="text-base font-medium text-[#1A2B48]/80">
        {translations.operations.empty.title}
      </p>
    </div>
  );
}

export function OperationsInboxClient({ initialFilters }: OperationsInboxClientProps) {
  const { operations, isLoading, error, retry } = useOperations(initialFilters);

  if (isLoading) return <OperationsLoading />;
  if (error) return <OperationsError error={error} onRetry={retry} />;
  if (operations.length === 0) return <OperationsEmpty />;

  return <OperationsTable operations={operations} />;
}
