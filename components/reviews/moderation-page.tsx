"use client";

import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import { ReviewModerationTable } from "./review-moderation-table";
import { ReviewStatusTabs } from "./review-status-tabs";
import { ModerateReviewModal } from "./moderate-review-modal";
import { useModerationState } from "./use-moderation-state";

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

function ModerationFeedbackBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      data-testid="moderation-feedback"
      role="status"
      aria-live="polite"
      className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
      >
        ✕
      </button>
    </div>
  );
}

export interface ModerationPageProps {
  initialReviews?: ReviewModerationItem[];
  initialStatus?: ReviewStatus;
}

export function ModerationPage(props: ModerationPageProps = {}) {
  const copy = translations.moderation;
  const state = useModerationState(props);

  return (
    <div className="space-y-6">
      <ReviewStatusTabs currentStatus={state.statusFilter} onStatusChange={state.setStatusFilter} />
      {state.feedback && (
        <ModerationFeedbackBanner
          message={state.feedback}
          onDismiss={state.dismissFeedback}
        />
      )}
      {state.error ? (
        <ModerationError error={state.error} onRetry={state.reload} />
      ) : state.isLoading ? (
        <ModerationSkeleton />
      ) : (
        <ReviewModerationTable
          reviews={state.reviews}
          emptyMessage={state.statusFilter ? copy.table.emptyFiltered : copy.table.empty}
          onHideReview={state.openModerateModal}
          onRestoreReview={state.restoreReview}
        />
      )}
      <ModerateReviewModal
        isOpen={Boolean(state.reviewToModerate)}
        onClose={state.closeModerateModal}
        review={state.reviewToModerate}
        onSubmit={state.submitModerate}
        isSubmitting={state.isSubmitting}
        error={state.modalError}
      />
    </div>
  );
}
