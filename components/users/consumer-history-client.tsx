"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type {
  ConsumerDetail,
  ConsumerHistoryFilters,
} from "@/domain/users/consumer-history";
import { getConsumerHistoryAction } from "@/app/(dashboard)/usuarios/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerHistorySkeleton } from "./consumer-history-skeleton";
import { ConsumerHistoryView } from "./consumer-history-view";

export interface ConsumerHistoryClientProps {
  id: string | number;
}

interface ConsumerHistoryState {
  data: ConsumerDetail | null;
  loadingMode: "initial" | "filter" | "more" | null;
  error: string | null;
  isForbidden: boolean;
  isNotFound: boolean;
  failedCursor?: string;
}

interface SelectedHistoryFilters {
  resourceType: string;
  status: string;
}

function appendUniqueHistory(
  current: ConsumerDetail["history"],
  nextPage: ConsumerDetail["history"],
): ConsumerDetail["history"] {
  const existing = new Set(
    current.map((item) => `${item.resourceType}:${item.resourceId}`),
  );
  const appended = [...current];
  for (const item of nextPage) {
    const key = `${item.resourceType}:${item.resourceId}`;
    if (existing.has(key)) continue;
    existing.add(key);
    appended.push(item);
  }
  return appended;
}

function ConsumerHistoryForbidden() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{translations.users.consumerDetail.forbidden}</p>
    </div>
  );
}

function ConsumerHistoryNotFound() {
  const copy = translations.users.consumerDetail;

  return (
    <div
      role="alert"
      data-testid="consumer-not-found"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs"
    >
      <p className="text-base font-medium text-[#1A2B48]/80">{copy.notFound}</p>
      <div className="mt-4">
        <Link
          href={ROUTES.users}
          className="inline-flex items-center text-sm font-medium text-[#147560] hover:underline"
        >
          {copy.backToList}
        </Link>
      </div>
    </div>
  );
}

function ConsumerHistoryError({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
    >
      <p className="font-medium">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {translations.users.consumerDetail.retry}
        </button>
      )}
    </div>
  );
}


function toRequestFilters(
  selected: SelectedHistoryFilters,
  cursor?: string,
): ConsumerHistoryFilters {
  return {
    ...(selected.resourceType !== "all" && { resourceType: selected.resourceType }),
    ...(selected.status !== "all" && { status: selected.status }),
    limit: 20,
    ...(cursor && { cursor }),
  };
}

function useConsumerHistory(id: string | number) {
  const requestSequence = useRef(0);
  const pendingCursor = useRef<string | null>(null);
  const [state, setState] = useState<ConsumerHistoryState>({
    data: null,
    loadingMode: "initial",
    error: null,
    isForbidden: false,
    isNotFound: false,
  });
  const [selectedFilters, setSelectedFilters] = useState<SelectedHistoryFilters>({
    resourceType: "all",
    status: "all",
  });

  const load = useCallback(async (
    filters: ConsumerHistoryFilters,
    loadingMode: "filter" | "more",
  ) => {
    const sequence = ++requestSequence.current;
    setState((prev) => ({
      ...prev,
      loadingMode,
      error: null,
      failedCursor: loadingMode === "more" ? filters.cursor : undefined,
      isForbidden: false,
      isNotFound: false,
    }));
    try {
      const result = await getConsumerHistoryAction(id, filters);
      if (sequence !== requestSequence.current) return;
      if (result.success) {
        setState((prev) => {
          const data = loadingMode === "more" && prev.data
            ? {
                ...prev.data,
                history: appendUniqueHistory(prev.data.history, result.data.history),
                pagination: result.data.pagination,
              }
            : result.data;
          return {
            data,
            loadingMode: null,
            error: null,
            isForbidden: false,
            isNotFound: false,
          };
        });
      } else {
        setState((prev) => ({
          data: prev.data,
          loadingMode: null,
          error: result.error,
          isForbidden: result.isForbidden ?? false,
          isNotFound: result.isNotFound ?? false,
          failedCursor: loadingMode === "more" ? filters.cursor : undefined,
        }));
      }
    } catch {
      if (sequence !== requestSequence.current) return;
      setState((prev) => ({
        data: prev.data,
        loadingMode: null,
        error: translations.users.consumerDetail.error,
        isForbidden: false,
        isNotFound: false,
        failedCursor: loadingMode === "more" ? filters.cursor : undefined,
      }));
    }
  }, [id]);

  const filterRequest = toRequestFilters(selectedFilters);

  useEffect(() => {
    void load(filterRequest, "filter");
    return () => {
      requestSequence.current += 1;
    };
  }, [filterRequest.resourceType, filterRequest.status, load]);

  const handleTypeChange = useCallback((resourceType: string) => {
    setSelectedFilters({ resourceType, status: "all" });
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedFilters((current) => ({ ...current, status }));
  }, []);

  const loadMore = useCallback(() => {
    const data = state.data;
    const nextCursor = data?.pagination.nextCursor;
    if (!nextCursor || pendingCursor.current === nextCursor) return;
    pendingCursor.current = nextCursor;
    void load(toRequestFilters(selectedFilters, nextCursor), "more").finally(() => {
      if (pendingCursor.current === nextCursor) pendingCursor.current = null;
    });
  }, [load, selectedFilters, state.data]);

  const retry = useCallback(() => {
    if (state.failedCursor) {
      void load(
        toRequestFilters(selectedFilters, state.failedCursor),
        "more",
      );
      return;
    }
    void load(filterRequest, "filter");
  }, [filterRequest, load, selectedFilters, state.data, state.failedCursor]);

  return {
    state,
    selectedFilters,
    handleTypeChange,
    handleStatusChange,
    loadMore,
    retry,
  };
}

export function ConsumerHistoryClient({ id }: ConsumerHistoryClientProps) {
  const {
    state,
    selectedFilters,
    handleTypeChange,
    handleStatusChange,
    loadMore,
    retry,
  } = useConsumerHistory(id);

  if (!state.data && state.loadingMode) {
    return <ConsumerHistorySkeleton />;
  }

  if (state.isForbidden) {
    return <ConsumerHistoryForbidden />;
  }

  if (state.isNotFound) {
    return <ConsumerHistoryNotFound />;
  }

  if (state.error && !state.data) {
    return <ConsumerHistoryError error={state.error} onRetry={retry} />;
  }

  if (!state.data) {
    return <ConsumerHistoryNotFound />;
  }

  return (
    <ConsumerHistoryView
      consumer={state.data}
      selectedType={selectedFilters.resourceType}
      selectedStatus={selectedFilters.status}
      isHistoryLoading={state.loadingMode === "filter"}
      isLoadingMore={state.loadingMode === "more"}
      isLoadMoreError={Boolean(state.failedCursor)}
      historyError={state.error}
      onTypeChange={handleTypeChange}
      onStatusChange={handleStatusChange}
      onLoadMore={loadMore}
      onRetryHistory={retry}
    />
  );
}
