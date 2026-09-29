"use client";

import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import { ReviewModerationTable } from "./review-moderation-table";
import { ReviewStatusTabs } from "./review-status-tabs";
import { ModerateReviewModal } from "./moderate-review-modal";
import { useModerationState } from "./use-moderation-state";
import { ModerationSkeleton } from "./moderation-skeleton";

function ModerationError({
  error,
  isForbidden = false,
  onRetry,
}: {
  error: string;
  isForbidden?: boolean;
  onRetry: () => void;
}) {
  const message = isForbidden
    ? translations.moderation.forbidden
    : error;

  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <p className="font-medium">{message}</p>
      {!isForbidden && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {translations.moderation.retry}
        </button>
      )}
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
        <ModerationError
          error={state.error}
          isForbidden={state.isForbidden}
          onRetry={state.reload}
        />
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
