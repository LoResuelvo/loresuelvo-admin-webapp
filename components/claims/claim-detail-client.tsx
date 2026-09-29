"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ClaimDetails } from "@/domain/claims/claim";
import { getClaimDetailsAction } from "@/app/(dashboard)/reclamos/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { ClaimDetailView } from "./claim-detail-view";

export interface ClaimDetailClientProps {
  id: string;
}

function DetailAlert({
  message,
  borderColor,
  bgColor,
  textColor,
  onRetry,
  backLink,
}: {
  message: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  onRetry?: () => void;
  backLink?: { href: string; label: string };
}) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border ${borderColor} ${bgColor} p-6 text-center ${textColor}`}
    >
      <p className="font-semibold text-lg">{message}</p>
      {backLink && (
        <div className="mt-4">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#147560]/20 bg-white px-4 py-2 text-sm font-medium text-[#147560] shadow-2xs hover:bg-[#147560]/5 transition-colors"
          >
            {backLink.label}
          </Link>
        </div>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E]"
        >
          {translations.claims.retry}
        </button>
      )}
    </div>
  );
}

function ClaimDetailLoading() {
  const copy = translations.claims.detail;
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-testid="claim-detail-loading"
      className="space-y-6"
    >
      <div className="h-64 animate-pulse rounded-2xl border border-[#1A2B48]/10 bg-white" />
      <span className="sr-only">{copy.loading}</span>
    </div>
  );
}

function useClaimDetail(id: string) {
  const copy = translations.claims;
  const [claim, setClaim] = useState<ClaimDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const loadClaim = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);
    setIsForbidden(false);
    try {
      const result = await getClaimDetailsAction(id);
      if (result.success) {
        setClaim(result.data);
      } else {
        if (result.isNotFound) {
          setIsNotFound(true);
        } else if (result.isForbidden) {
          setIsForbidden(true);
        }
        setError(result.error);
      }
    } catch {
      setError(copy.detail.error);
    } finally {
      setIsLoading(false);
    }
  }, [id, copy.detail.error]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  return { claim, isLoading, error, isNotFound, isForbidden, reload: loadClaim };
}

export function ClaimDetailClient({ id }: ClaimDetailClientProps) {
  const copy = translations.claims;
  const { claim, isLoading, error, isNotFound, isForbidden, reload } = useClaimDetail(id);

  if (isForbidden) {
    return (
      <DetailAlert
        message={error ?? copy.forbidden}
        borderColor="border-amber-200"
        bgColor="bg-amber-50"
        textColor="text-amber-800"
        backLink={{ href: ROUTES.claims, label: copy.detail.backToList }}
      />
    );
  }

  if (isNotFound) {
    return (
      <DetailAlert
        message={error ?? copy.detail.notFound}
        borderColor="border-slate-200"
        bgColor="bg-slate-50"
        textColor="text-slate-700"
        backLink={{ href: ROUTES.claims, label: copy.detail.backToList }}
      />
    );
  }

  if (error) {
    return (
      <DetailAlert
        message={error}
        borderColor="border-rose-200"
        bgColor="bg-rose-50"
        textColor="text-rose-700"
        onRetry={reload}
      />
    );
  }

  if (isLoading || !claim) {
    return <ClaimDetailLoading />;
  }

  return <ClaimDetailView claim={claim} />;
}
