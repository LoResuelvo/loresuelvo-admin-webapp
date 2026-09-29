"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuditAction, AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";
import { translations } from "@/infrastructure/i18n/translations";
import { getAuditLogsAction } from "@/app/(dashboard)/auditoria/actions";
import { AuditFiltersBar, type AuditFiltersState } from "./audit-filters-bar";
import { AuditTable } from "./audit-table";
import { AuditDetailModal } from "./audit-detail-modal";

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
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [filters, setFilters] = useState<AuditFiltersState>({
    action: initialFilters?.action ?? "",
    operator: initialFilters?.operator ?? "",
    from: initialFilters?.from ?? "",
    to: initialFilters?.to ?? "",
  });
  const [status, setStatus] = useState<AsyncStatus>({ loading: true, error: null, forbidden: false });

  const loadAuditLogs = useCallback(async (activeFilters: AuditFiltersState) => {
    setStatus({ loading: true, error: null, forbidden: false });
    try {
      const res = await getAuditLogsAction(buildApiFilters(activeFilters));
      if (res.success) {
        setEntries(res.data);
        setStatus({ loading: false, error: null, forbidden: false });
      } else {
        setStatus({ loading: false, error: res.error, forbidden: Boolean(res.isForbidden) });
      }
    } catch {
      setStatus({ loading: false, error: copy.error, forbidden: false });
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
      {status.loading ? (
        <AuditConsoleSkeleton />
      ) : status.forbidden ? (
        <AuditForbidden message={status.error ?? copy.forbidden} />
      ) : status.error ? (
        <AuditErrorView error={status.error} onRetry={() => loadAuditLogs(filters)} />
      ) : (
        <AuditTable
          entries={entries}
          emptyMessage={hasActiveFilters ? copy.table.emptyFiltered : undefined}
          onSelectEntry={(entry) => setSelectedEntry(entry as AuditLogEntry)}
        />
      )}
      <AuditDetailModal
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </div>
  );
}
