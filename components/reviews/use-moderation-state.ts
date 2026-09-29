import { useCallback, useEffect, useRef, useState } from "react";
import type {
  InfractionCategory,
  ReviewModerationItem,
  ReviewStatus,
} from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import {
  getReviewsAction,
  moderateReviewAction,
} from "@/app/(dashboard)/moderacion/actions";

export interface UseModerationStateProps {
  initialReviews?: ReviewModerationItem[];
  initialStatus?: ReviewStatus;
}

interface ModerationState {
  reviews: ReviewModerationItem[];
  statusFilter: ReviewStatus | undefined;
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
  reviewToModerate: ReviewModerationItem | null;
  isSubmitting: boolean;
  modalError: string | null;
  feedback: string | null;
}

function defaultState(
  reviews?: ReviewModerationItem[],
  status?: ReviewStatus,
): ModerationState {
  return {
    reviews: reviews ?? [],
    statusFilter: status,
    isLoading: !reviews,
    error: null,
    isForbidden: false,
    reviewToModerate: null,
    isSubmitting: false,
    modalError: null,
    feedback: null,
  };
}

function applyModerationSuccess(
  prev: ModerationState,
  data: ReviewModerationItem,
): ModerationState {
  return {
    ...prev,
    reviews: prev.reviews.map((r) => (r.id === data.id ? data : r)),
    reviewToModerate: null,
    feedback: translations.moderation.feedback.hiddenSuccess,
    isSubmitting: false,
  };
}

async function performModerate(
  reviewId: string,
  data: { category: InfractionCategory; reason: string },
  setState: React.Dispatch<React.SetStateAction<ModerationState>>,
) {
  setState((prev) => ({ ...prev, isSubmitting: true, modalError: null }));
  try {
    const res = await moderateReviewAction(reviewId, "hide", data.category, data.reason);
    if (res.success) {
      setState((prev) => applyModerationSuccess(prev, res.data));
    } else {
      setState((prev) => ({ ...prev, modalError: res.error, isSubmitting: false }));
    }
  } catch {
    setState((prev) => ({ ...prev, modalError: translations.moderation.error, isSubmitting: false }));
  }
}

async function performRestore(
  reviewId: string,
  setState: React.Dispatch<React.SetStateAction<ModerationState>>,
) {
  try {
    const res = await moderateReviewAction(reviewId, "unhide");
    if (res.success) {
      setState((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) => (r.id === res.data.id ? res.data : r)),
        feedback: translations.moderation.feedback.restoredSuccess,
      }));
    } else {
      setState((prev) => ({ ...prev, error: res.error }));
    }
  } catch {
    setState((prev) => ({ ...prev, error: translations.moderation.error }));
  }
}

export function useModerationState({
  initialReviews,
  initialStatus,
}: UseModerationStateProps = {}) {
  const [state, setState] = useState<ModerationState>(() =>
    defaultState(initialReviews, initialStatus),
  );
  const isFirstRender = useRef(true);

  const loadReviews = useCallback(async (status?: ReviewStatus) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const res = await getReviewsAction(status);
      setState((prev) => ({
        ...prev,
        reviews: res.success ? res.data : prev.reviews,
        error: res.success ? null : res.error,
        isForbidden: res.success ? false : Boolean(res.isForbidden),
        isLoading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        error: translations.moderation.error,
        isForbidden: false,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialReviews) return;
    }
    loadReviews(state.statusFilter);
  }, [loadReviews, state.statusFilter, initialReviews]);

  return {
    ...state,
    setStatusFilter: (status?: ReviewStatus) => setState((prev) => ({ ...prev, statusFilter: status })),
    reload: () => loadReviews(state.statusFilter),
    openModerateModal: (review: ReviewModerationItem) =>
      setState((prev) => ({ ...prev, reviewToModerate: review, modalError: null })),
    closeModerateModal: () =>
      setState((prev) => ({ ...prev, reviewToModerate: null, modalError: null })),
    submitModerate: (data: { category: InfractionCategory; reason: string }) =>
      state.reviewToModerate ? performModerate(state.reviewToModerate.id, data, setState) : Promise.resolve(),
    restoreReview: (review: ReviewModerationItem) => performRestore(review.id, setState),
    dismissFeedback: () => setState((prev) => ({ ...prev, feedback: null })),
  };
}
