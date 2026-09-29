"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Claim } from "@/domain/claims/claim";
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
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filters, setFilters] = useState<ClaimsFiltersState>({ status: "", q: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const loadClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);
    try {
      const result = await getClaimsAction(filters);
      if (result.success) {
        setClaims(result.data);
      } else {
        if (result.isForbidden) {
          setIsForbidden(true);
        }
        setError(result.error);
      }
    } catch {
      setError(copy.error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, copy.error]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleSelectClaim = (claim: Claim) => {
    router.push(ROUTES.claimDetail(claim.id));
  };

  const hasActiveFilters = filters.status !== "" || filters.q !== "";

  return (
    <div className="space-y-6">
      <ClaimsFilters filters={filters} onChange={setFilters} />

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
    </div>
  );
}
