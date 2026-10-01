import { useCallback, useEffect, useRef, useState } from "react";
import {
  updateModeratedReviews,
  type InfractionCategory,
  type ReviewModerationItem,
  type ReviewStatus,
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
    reviews: updateModeratedReviews(prev.reviews, data, prev.statusFilter),
    reviewToModerate: null,
    feedback: translations.moderation.feedback.hiddenSuccess,
    isSubmitting: false,
  };
}

async function performModerate(
  reviewId: string,
  data: { category: InfractionCategory; reason: string },
  setState: React.Dispatch<React.SetStateAction<ModerationState>>,
  recordMutation: (review: ReviewModerationItem) => void,
) {
  setState((prev) => ({ ...prev, isSubmitting: true, modalError: null }));
  try {
    const res = await moderateReviewAction(reviewId, "hide", data.category, data.reason);
    if (res.success) {
      recordMutation(res.data);
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
  recordMutation: (review: ReviewModerationItem) => void,
) {
  try {
    const res = await moderateReviewAction(reviewId, "unhide");
    if (res.success) {
      recordMutation(res.data);
      setState((prev) => ({
        ...prev,
        reviews: updateModeratedReviews(prev.reviews, res.data, prev.statusFilter),
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
  const skipInitialLoad = useRef(Boolean(initialReviews));
  const mounted = useRef(true);
  const requestId = useRef(0);
  // Only results confirmed during the current load may supersede its snapshot.
  const confirmedMutations = useRef<Map<string, ReviewModerationItem> | null>(null);
  const recordMutation = (review: ReviewModerationItem) => {
    confirmedMutations.current?.set(review.id, review);
  };
  const setMountedState: typeof setState = (update) => {
    if (mounted.current) setState(update);
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current += 1;
      confirmedMutations.current = null;
    };
  }, []);

  const loadReviews = useCallback(async (status?: ReviewStatus) => {
    const currentRequest = ++requestId.current;
    confirmedMutations.current = new Map();
    const isCurrent = () => mounted.current && currentRequest === requestId.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const res = await getReviewsAction(status);
      if (!isCurrent()) return;
      let reviews = res.success ? res.data : null;
      if (reviews) {
        for (const mutation of confirmedMutations.current?.values() ?? []) {
          reviews = updateModeratedReviews(reviews, mutation, status);
        }
      }
      confirmedMutations.current = null;
      setState((prev) => ({
        ...prev,
        reviews: reviews ?? prev.reviews,
        error: res.success ? null : res.error,
        isForbidden: res.success ? false : Boolean(res.isForbidden),
        isLoading: false,
      }));
    } catch {
      if (!isCurrent()) return;
      confirmedMutations.current = null;
      setState((prev) => ({
        ...prev,
        error: translations.moderation.error,
        isForbidden: false,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false;
      return;
    }
    loadReviews(state.statusFilter);
  }, [loadReviews, state.statusFilter]);

  return {
    ...state,
    setStatusFilter: (status?: ReviewStatus) => {
      if (status === state.statusFilter) return;
      requestId.current += 1;
      setState((prev) => ({ ...prev, statusFilter: status }));
    },
    reload: () => loadReviews(state.statusFilter),
    openModerateModal: (review: ReviewModerationItem) =>
      setState((prev) => ({ ...prev, reviewToModerate: review, modalError: null })),
    closeModerateModal: () =>
      setState((prev) => ({ ...prev, reviewToModerate: null, modalError: null })),
    submitModerate: (data: { category: InfractionCategory; reason: string }) =>
      state.reviewToModerate ? performModerate(state.reviewToModerate.id, data, setMountedState, recordMutation) : Promise.resolve(),
    restoreReview: (review: ReviewModerationItem) => performRestore(review.id, setMountedState, recordMutation),
    dismissFeedback: () => setState((prev) => ({ ...prev, feedback: null })),
  };
}
