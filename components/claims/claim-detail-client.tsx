"use client";

// Client container for claim detail and dispute resolution

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ClaimDetails } from "@/domain/claims/claim";
import { getClaimDetailsAction, resolveClaimAction } from "@/app/(dashboard)/reclamos/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { ClaimDetailView } from "./claim-detail-view";
import { ClaimDetailSkeleton } from "./claim-detail-skeleton";
import { ClaimResolutionModal, type ClaimResolutionFormData } from "./claim-resolution-modal";

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

  return { claim, setClaim, isLoading, error, isNotFound, isForbidden, reload: loadClaim };
}

function useClaimResolution(
  id: string,
  setClaim: React.Dispatch<React.SetStateAction<ClaimDetails | null>>,
) {
  const copy = translations.claims;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setError(null);
    }
  };

  const handleResolve = async (data: ClaimResolutionFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await resolveClaimAction(id, data);
      if (result.success) {
        setClaim((prev) =>
          prev ? { ...prev, status: "resolved", resolution: result.data } : prev,
        );
        setSuccessMessage(copy.resolution.successMessage);
        setIsOpen(false);
      } else {
        setError(result.error);
      }
    } catch {
      setError(copy.detail.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    isSubmitting,
    error,
    successMessage,
    handleOpen,
    handleClose,
    handleResolve,
  };
}

function ClaimDetailStatusView({
  isForbidden,
  isNotFound,
  error,
  isLoading,
  hasClaim,
  onRetry,
}: {
  isForbidden: boolean;
  isNotFound: boolean;
  error: string | null;
  isLoading: boolean;
  hasClaim: boolean;
  onRetry: () => void;
}) {
  const copy = translations.claims;
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
        onRetry={onRetry}
      />
    );
  }
  if (isLoading || !hasClaim) {
    return <ClaimDetailSkeleton />;
  }
  return null;
}

export function ClaimDetailClient({ id }: ClaimDetailClientProps) {
  const { claim, setClaim, isLoading, error, isNotFound, isForbidden, reload } = useClaimDetail(id);
  const resolution = useClaimResolution(id, setClaim);

  const statusElement = (
    <ClaimDetailStatusView
      isForbidden={isForbidden}
      isNotFound={isNotFound}
      error={error}
      isLoading={isLoading}
      hasClaim={Boolean(claim)}
      onRetry={reload}
    />
  );
  if (!claim || isLoading || isForbidden || isNotFound || error) {
    return statusElement;
  }

  return (
    <>
      <ClaimDetailView
        claim={claim}
        onOpenResolutionModal={resolution.handleOpen}
        successMessage={resolution.successMessage}
      />
      <ClaimResolutionModal
        isOpen={resolution.isOpen}
        onClose={resolution.handleClose}
        onSubmit={resolution.handleResolve}
        isSubmitting={resolution.isSubmitting}
        error={resolution.error}
      />
    </>
  );
}
