"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { ConsumerDetail } from "@/domain/users/consumer-history";
import { getConsumerHistoryAction } from "@/app/(dashboard)/usuarios/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerHistorySkeleton } from "./consumer-history-skeleton";
import { ConsumerHistoryView } from "./consumer-history-view";

export interface ConsumerHistoryClientProps {
  id: string | number;
}

interface ConsumerHistoryState {
  data: ConsumerDetail | null;
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
  isNotFound: boolean;
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


function useConsumerHistory(id: string | number) {
  const [state, setState] = useState<ConsumerHistoryState>({
    data: null,
    isLoading: true,
    error: null,
    isForbidden: false,
    isNotFound: false,
  });

  const load = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      isForbidden: false,
      isNotFound: false,
    }));
    try {
      const result = await getConsumerHistoryAction(id);
      if (result.success) {
        setState({
          data: result.data,
          isLoading: false,
          error: null,
          isForbidden: false,
          isNotFound: false,
        });
      } else {
        setState({
          data: null,
          isLoading: false,
          error: result.error,
          isForbidden: result.isForbidden ?? false,
          isNotFound: result.isNotFound ?? false,
        });
      }
    } catch {
      setState({
        data: null,
        isLoading: false,
        error: translations.users.consumerDetail.error,
        isForbidden: false,
        isNotFound: false,
      });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { state, reload: load };
}

export function ConsumerHistoryClient({ id }: ConsumerHistoryClientProps) {
  const { state, reload } = useConsumerHistory(id);

  if (state.isLoading) {
    return <ConsumerHistorySkeleton />;
  }

  if (state.isForbidden) {
    return <ConsumerHistoryForbidden />;
  }

  if (state.isNotFound) {
    return <ConsumerHistoryNotFound />;
  }

  if (state.error) {
    return <ConsumerHistoryError error={state.error} onRetry={reload} />;
  }

  if (!state.data) {
    return <ConsumerHistoryNotFound />;
  }

  return <ConsumerHistoryView consumer={state.data} />;
}
