"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuditAction, AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";
import { translations } from "@/infrastructure/i18n/translations";
import { getAuditLogsAction } from "@/app/(dashboard)/auditoria/actions";
import { AuditFiltersBar, type AuditFiltersState } from "./audit-filters-bar";
import { AuditTable } from "./audit-table";

function AuditForbidden({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{message}</p>
    </div>
  );
}

function AuditErrorView({ error, onRetry }: { error: string; onRetry: () => void }) {
  const copy = translations.audit;
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <p className="font-medium">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {copy.retry}
      </button>
    </div>
  );
}

function AuditConsoleSkeleton() {
  const copy = translations.audit;
  return (
    <div aria-busy="true" aria-label={copy.loading} className="space-y-4">
      <div className="h-64 animate-pulse rounded-2xl border border-[#1A2B48]/10 bg-white" />
    </div>
  );
}

function buildApiFilters(filters: AuditFiltersState): AuditFilters {
  return {
    ...(filters.action ? { action: filters.action as AuditAction } : {}),
    ...(filters.operator?.trim() ? { operator: filters.operator.trim() } : {}),
    ...(filters.from?.trim() ? { from: filters.from.trim() } : {}),
    ...(filters.to?.trim() ? { to: filters.to.trim() } : {}),
  };
}

export interface AuditConsolePageProps {
  initialFilters?: AuditFilters;
}

export function AuditConsolePage({ initialFilters }: AuditConsolePageProps) {
  const copy = translations.audit;
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [filters, setFilters] = useState<AuditFiltersState>({
    action: initialFilters?.action ?? "",
    operator: initialFilters?.operator ?? "",
    from: initialFilters?.from ?? "",
    to: initialFilters?.to ?? "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const loadAuditLogs = useCallback(async (activeFilters: AuditFiltersState) => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);
    try {
      const result = await getAuditLogsAction(buildApiFilters(activeFilters));
      if (result.success) {
        setEntries(result.data);
      } else {
        if (result.isForbidden) setIsForbidden(true);
        setError(result.error);
      }
    } catch {
      setError(copy.error);
    } finally {
      setIsLoading(false);
    }
  }, [copy.error]);

  useEffect(() => {
    void loadAuditLogs(filters);
  }, [filters, loadAuditLogs]);

  const hasActiveFilters = Boolean(
    filters.action || filters.operator || filters.from || filters.to,
  );

  return (
    <div className="space-y-6">
      <AuditFiltersBar filters={filters} onChange={setFilters} />
      {isLoading ? (
        <AuditConsoleSkeleton />
      ) : isForbidden ? (
        <AuditForbidden message={error ?? copy.forbidden} />
      ) : error ? (
        <AuditErrorView error={error} onRetry={() => loadAuditLogs(filters)} />
      ) : (
        <AuditTable
          entries={entries}
          emptyMessage={hasActiveFilters ? copy.table.emptyFiltered : undefined}
        />
      )}
    </div>
  );
}
