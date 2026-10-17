"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";
import { translations } from "@/infrastructure/i18n/translations";
import { getAuditLogsAction } from "@/app/(dashboard)/auditoria/actions";
import { AuditFiltersBar, type AuditFiltersState } from "./audit-filters-bar";
import { AuditTable } from "./audit-table";
import { AuditDetailModal } from "./audit-detail-modal";
import { AuditSkeleton } from "./audit-skeleton";

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

function buildApiFilters(filters: AuditFiltersState): AuditFilters {
  const operatorId = Number(filters.operatorId);
  return {
    ...(filters.action ? { action: filters.action } : {}),
    ...(Number.isInteger(operatorId) && operatorId > 0 ? { operatorId } : {}),
    ...(filters.from?.trim() ? { from: filters.from.trim() } : {}),
    ...(filters.to?.trim() ? { to: filters.to.trim() } : {}),
  };
}

interface AsyncStatus {
  loading: boolean;
  error: string | null;
  forbidden: boolean;
}

export interface AuditConsolePageProps {
  initialFilters?: AuditFilters;
}

export function AuditConsolePage({ initialFilters }: AuditConsolePageProps) {
  const copy = translations.audit;
  const requestGeneration = useRef(0);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<{ cursor: string | null; loading: boolean; error: string | null }>({
    cursor: null, loading: false, error: null,
  });
  const { cursor: nextCursor, loading: isLoadingMore, error: loadMoreError } = pagination;
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [filters, setFilters] = useState<AuditFiltersState>({
    action: initialFilters?.action ?? "",
    operatorId: initialFilters?.operatorId ? String(initialFilters.operatorId) : "",
    from: initialFilters?.from ?? "",
    to: initialFilters?.to ?? "",
  });
  const [status, setStatus] = useState<AsyncStatus>({ loading: true, error: null, forbidden: false });

  const loadAuditLogs = useCallback(async (activeFilters: AuditFiltersState) => {
    const generation = ++requestGeneration.current;
    setPagination({ cursor: null, loading: false, error: null });
    setStatus({ loading: true, error: null, forbidden: false });
    try {
      const res = await getAuditLogsAction(buildApiFilters(activeFilters));
      if (generation !== requestGeneration.current) return;
      if (res.success) {
        setEntries([...res.data.events]);
        setPagination(current => ({ ...current, cursor: res.data.nextCursor }));
        setStatus({ loading: false, error: null, forbidden: false });
      } else {
        setStatus({ loading: false, error: res.error, forbidden: Boolean(res.isForbidden) });
      }
    } catch {
      if (generation !== requestGeneration.current) return;
      setStatus({ loading: false, error: copy.error, forbidden: false });
    }
  }, [copy.error]);

  const loadNextPage = useCallback(async (
    activeFilters: AuditFiltersState,
    cursor: string,
  ) => {
    const generation = requestGeneration.current;
    setPagination(current => ({ ...current, loading: true, error: null }));
    try {
      const res = await getAuditLogsAction(buildApiFilters(activeFilters), cursor);
      if (generation !== requestGeneration.current) return;
      if (res.success) {
        setEntries((current) => [...current, ...res.data.events]);
        setPagination(current => ({ ...current, cursor: res.data.nextCursor }));
      } else {
        setPagination(current => ({ ...current, error: res.error }));
      }
    } catch {
      if (generation !== requestGeneration.current) return;
      setPagination(current => ({ ...current, error: copy.error }));
    } finally {
      if (generation === requestGeneration.current) setPagination(current => ({ ...current, loading: false }));
    }
  }, [copy.error]);

  useEffect(() => {
    void loadAuditLogs(filters);
    return () => { requestGeneration.current += 1; };
  }, [filters, loadAuditLogs]);

  const hasActiveFilters = Boolean(
    filters.action || filters.operatorId || filters.from || filters.to,
  );

  return (
    <div className="space-y-6">
      <AuditFiltersBar filters={filters} onChange={setFilters} />
      {status.loading ? (
        <AuditSkeleton />
      ) : status.forbidden ? (
        <AuditForbidden message={status.error ?? copy.forbidden} />
      ) : status.error ? (
        <AuditErrorView error={status.error} onRetry={() => loadAuditLogs(filters)} />
      ) : (
        <AuditTable
          entries={entries}
          emptyMessage={hasActiveFilters ? copy.table.emptyFiltered : undefined}
          onSelectEntry={setSelectedEntry}
        />
      )}
      {!status.loading && !status.error && !status.forbidden && nextCursor && (
        <div className="flex flex-col items-center gap-2">
          {loadMoreError && <p role="alert" className="text-sm text-red-700">{loadMoreError}</p>}
          <button
            type="button"
            onClick={() => void loadNextPage(filters, nextCursor)}
            disabled={isLoadingMore}
            aria-busy={isLoadingMore}
            className="inline-flex items-center rounded-lg border border-[#147560] px-4 py-2 text-sm font-medium text-[#147560] transition-colors hover:bg-[#147560]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoadingMore
              ? copy.loadingMore
              : loadMoreError
                ? copy.retry
                : copy.loadMore}
          </button>
        </div>
      )}
      <AuditDetailModal
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </div>
  );
}
