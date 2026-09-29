"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import { getReviewsAction } from "@/app/(dashboard)/moderacion/actions";
import { ReviewModerationTable } from "./review-moderation-table";
import { ReviewStatusTabs } from "./review-status-tabs";

function ModerationError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <p className="font-medium">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {translations.moderation.retry}
      </button>
    </div>
  );
}

function ModerationSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando reseñas" className="space-y-4">
      <div className="h-64 animate-pulse rounded-2xl border border-[#1A2B48]/10 bg-white" />
    </div>
  );
}

export interface ModerationPageProps {
  initialReviews?: ReviewModerationItem[];
  initialStatus?: ReviewStatus;
}

export function ModerationPage({ initialReviews, initialStatus }: ModerationPageProps = {}) {
  const copy = translations.moderation;
  const [reviews, setReviews] = useState<ReviewModerationItem[]>(initialReviews ?? []);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>(initialStatus);
  const [isLoading, setIsLoading] = useState(!initialReviews);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  const loadReviews = useCallback(async (status?: ReviewStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReviewsAction(status);
      if (result.success) {
        setReviews(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError(copy.error);
    } finally {
      setIsLoading(false);
    }
  }, [copy.error]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialReviews) {
        return;
      }
    }
    loadReviews(statusFilter);
  }, [loadReviews, statusFilter, initialReviews]);

  const handleStatusChange = (status?: ReviewStatus) => {
    setStatusFilter(status);
  };

  return (
    <div className="space-y-6">
      <ReviewStatusTabs
        currentStatus={statusFilter}
        onStatusChange={handleStatusChange}
      />

      {error ? (
        <ModerationError error={error} onRetry={() => loadReviews(statusFilter)} />
      ) : isLoading ? (
        <ModerationSkeleton />
      ) : (
        <ReviewModerationTable
          reviews={reviews}
          emptyMessage={statusFilter ? copy.table.emptyFiltered : copy.table.empty}
        />
      )}
    </div>
  );
}
