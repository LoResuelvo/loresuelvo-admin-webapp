import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyModerationResult,
  updateModeratedReviews,
  type InfractionCategory,
  type ReviewModerationCommand,
  type ReviewModerationDetail,
  type ReviewModerationItem,
  type ReviewListFilter,
} from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import {
  getReviewDetailAction,
  getReviewsAction,
  moderateReviewAction,
} from "@/app/(dashboard)/moderacion/actions";

export interface UseModerationStateProps {
  initialReviews?: ReviewModerationItem[];
  initialStatus?: ReviewListFilter;
}

type ModerationAction = ReviewModerationCommand["action"];

interface ModerationState {
  reviews: ReviewModerationItem[];
  statusFilter: ReviewListFilter | undefined;
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
  reviewToModerate: ReviewModerationItem | null;
  reviewDetail: ReviewModerationDetail | null;
  moderationAction: ModerationAction | null;
  isLoadingDetail: boolean;
  isSubmitting: boolean;
  modalError: string | null;
  feedback: string | null;
}

function defaultState(reviews?: ReviewModerationItem[], status?: ReviewListFilter): ModerationState {
  return {
    reviews: reviews ?? [],
    statusFilter: status,
    isLoading: !reviews,
    error: null,
    isForbidden: false,
    reviewToModerate: null,
    reviewDetail: null,
    moderationAction: null,
    isLoadingDetail: false,
    isSubmitting: false,
    modalError: null,
    feedback: null,
  };
}

function mergeConfirmedReviews(
  reviews: ReviewModerationItem[],
  mutations: Iterable<ReviewModerationItem>,
  status?: ReviewListFilter,
): ReviewModerationItem[] {
  return [...mutations].reduce(
    (current, mutation) => updateModeratedReviews(current, mutation, status),
    reviews,
  );
}

function applyModerationSuccess(
  previous: ModerationState,
  updated: ReviewModerationItem,
  action: ModerationAction,
): ModerationState {
  return {
    ...previous,
    reviews: updateModeratedReviews(previous.reviews, updated, previous.statusFilter),
    reviewToModerate: null,
    reviewDetail: null,
    moderationAction: null,
    isLoadingDetail: false,
    modalError: null,
    feedback: action === "hide"
      ? translations.moderation.feedback.hiddenSuccess
      : translations.moderation.feedback.restoredSuccess,
    isSubmitting: false,
  };
}

async function performModerate(
  review: ReviewModerationDetail,
  action: ModerationAction,
  data: { category?: InfractionCategory; reason: string },
  setState: React.Dispatch<React.SetStateAction<ModerationState>>,
  recordMutation: (review: ReviewModerationItem) => void,
) {
  const command: ReviewModerationCommand = {
    action,
    reason: data.reason,
    expectedVersion: review.review.version,
    ...(action === "hide" && data.category ? { category: data.category } : {}),
    ...(action === "hide" && review.report?.status === "pending" ? { reportId: review.report.id } : {}),
  };
  setState((previous) => ({ ...previous, isSubmitting: true, modalError: null }));
  try {
    const result = await moderateReviewAction(review.review.id, command);
    if (result.success) {
      const updated = applyModerationResult(review.review, result.data);
      recordMutation(updated);
      setState((previous) => applyModerationSuccess(previous, updated, action));
    } else {
      setState((previous) => ({ ...previous, modalError: result.error, isSubmitting: false }));
    }
  } catch {
    setState((previous) => ({
      ...previous,
      modalError: translations.moderation.error,
      isSubmitting: false,
    }));
  }
}

export function useModerationState({ initialReviews, initialStatus }: UseModerationStateProps = {}) {
  const [state, setState] = useState<ModerationState>(() => defaultState(initialReviews, initialStatus));
  const skipInitialLoad = useRef(Boolean(initialReviews));
  const mounted = useRef(true);
  const requestId = useRef(0);
  const detailRequestId = useRef(0);
  const confirmedMutations = useRef<Map<string, ReviewModerationItem> | null>(null);
  const recordMutation = (review: ReviewModerationItem) => confirmedMutations.current?.set(review.id, review);
  const setMountedState: typeof setState = (update) => {
    if (mounted.current) setState(update);
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current += 1;
      detailRequestId.current += 1;
      confirmedMutations.current = null;
    };
  }, []);

  const loadReviews = useCallback(async (status?: ReviewListFilter) => {
    const currentRequest = ++requestId.current;
    confirmedMutations.current = new Map();
    const isCurrent = () => mounted.current && currentRequest === requestId.current;
    setState((previous) => ({ ...previous, isLoading: true, error: null, isForbidden: false }));
    try {
      const result = await getReviewsAction(status);
      if (!isCurrent()) return;
      let reviews = result.success ? result.data : null;
      if (reviews) {
        reviews = mergeConfirmedReviews(reviews, confirmedMutations.current?.values() ?? [], status);
      }
      confirmedMutations.current = null;
      setState((previous) => ({
        ...previous,
        reviews: reviews ?? previous.reviews,
        error: result.success ? null : result.error,
        isForbidden: result.success ? false : Boolean(result.isForbidden),
        isLoading: false,
      }));
    } catch {
      if (!isCurrent()) return;
      confirmedMutations.current = null;
      setState((previous) => ({
        ...previous,
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

  const openModerationModal = async (review: ReviewModerationItem, action: ModerationAction) => {
    const currentRequest = ++detailRequestId.current;
    setState((previous) => ({
      ...previous,
      reviewToModerate: review,
      reviewDetail: null,
      moderationAction: action,
      isLoadingDetail: true,
      modalError: null,
    }));
    try {
      const result = await getReviewDetailAction(review.id);
      if (!mounted.current || currentRequest !== detailRequestId.current) return;
      if (result.success) {
        setState((previous) => ({ ...previous, reviewDetail: result.data, isLoadingDetail: false }));
      } else {
        setState((previous) => ({
          ...previous,
          isLoadingDetail: false,
          modalError: result.error,
        }));
      }
    } catch {
      if (!mounted.current || currentRequest !== detailRequestId.current) return;
      setState((previous) => ({
        ...previous,
        isLoadingDetail: false,
        modalError: translations.moderation.modal.detailError,
      }));
    }
  };

  const closeModerateModal = () => {
    detailRequestId.current += 1;
    setState((previous) => ({
      ...previous,
      reviewToModerate: null,
      reviewDetail: null,
      moderationAction: null,
      isLoadingDetail: false,
      modalError: null,
    }));
  };

  return {
    ...state,
    setStatusFilter: (status?: ReviewListFilter) => {
      if (status === state.statusFilter) return;
      requestId.current += 1;
      setState((previous) => ({ ...previous, statusFilter: status }));
    },
    reload: () => loadReviews(state.statusFilter),
    openModerateModal: (review: ReviewModerationItem) => openModerationModal(review, "hide"),
    openRestoreModal: (review: ReviewModerationItem) => openModerationModal(review, "unhide"),
    closeModerateModal,
    submitModerate: (data: { category?: InfractionCategory; reason: string }) => {
      if (!state.reviewDetail || !state.moderationAction) return Promise.resolve();
      return performModerate(state.reviewDetail, state.moderationAction, data, setMountedState, recordMutation);
    },
    dismissFeedback: () => setState((previous) => ({ ...previous, feedback: null })),
  };
}
