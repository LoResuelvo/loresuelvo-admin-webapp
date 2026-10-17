"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Claim, ClaimPage } from "@/domain/claims/claim";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { getClaimsAction } from "@/app/(dashboard)/reclamos/actions";
import { ClaimsFilters, type ClaimsFiltersState } from "./claims-filters";
import { ClaimsTable } from "./claims-table";

function ClaimsForbidden({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{message}</p>
    </div>
  );
}

function ClaimsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <p className="font-medium">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {translations.claims.retry}
      </button>
    </div>
  );
}

function ClaimsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando reclamos" className="space-y-4">
      <div className="h-64 animate-pulse rounded-2xl border border-[#1A2B48]/10 bg-white" />
    </div>
  );
}

export function ClaimsInboxPage() {
  const router = useRouter();
  const copy = translations.claims;
  const generation = useRef(0);
  const [page, setPage] = useState(1);
  const [resultPage, setResultPage] = useState<ClaimPage | null>(null);
  const claims = resultPage?.items ?? [];
  const totalPages = resultPage ? Math.max(1, Math.ceil(resultPage.total / resultPage.limit)) : 1;
  const [filters, setFilters] = useState<ClaimsFiltersState>({ status: "", q: "" });
  const [status, setStatus] = useState<{ loading: boolean; error: string | null; forbidden: boolean }>({
    loading: true, error: null, forbidden: false,
  });
  const { loading: isLoading, error, forbidden: isForbidden } = status;

  const loadClaims = useCallback(async () => {
    const requestId = ++generation.current;
    setStatus({ loading: true, error: null, forbidden: false });
    try {
      const result = await getClaimsAction({ ...filters, page });
      if (requestId !== generation.current) return;
      if (result.success) {
        setResultPage(result.data);
        setStatus({ loading: false, error: null, forbidden: false });
      } else {
        setStatus({ loading: false, error: result.error, forbidden: Boolean(result.isForbidden) });
      }
    } catch {
      if (requestId !== generation.current) return;
      setStatus({ loading: false, error: copy.error, forbidden: false });
    }
  }, [filters, page, copy.error]);

  useEffect(() => {
    void loadClaims();
    return () => { generation.current += 1; };
  }, [loadClaims]);

  const handleSelectClaim = (claim: Claim) => {
    router.push(ROUTES.claimDetail(claim.id));
  };

  const hasActiveFilters = filters.status !== "" || filters.q !== "";

  return (
    <div className="space-y-6">
      <ClaimsFilters filters={filters} onChange={next => { setFilters(next); setPage(1); }} />

      {isForbidden ? (
        <ClaimsForbidden message={error ?? copy.forbidden} />
      ) : error ? (
        <ClaimsError error={error} onRetry={loadClaims} />
      ) : isLoading ? (
        <ClaimsSkeleton />
      ) : (
        <ClaimsTable
          claims={claims}
          onSelectClaim={handleSelectClaim}
          emptyMessage={hasActiveFilters ? copy.table.emptyFiltered : copy.table.empty}
        />
      )}
      {!isLoading && !error && !isForbidden && totalPages > 1 && (
        <nav aria-label={copy.paginationLabel} className="flex items-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{copy.previousPage}</button>
          <span>{copy.page} {page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>{copy.nextPage}</button>
        </nav>
      )}
    </div>
  );
}
