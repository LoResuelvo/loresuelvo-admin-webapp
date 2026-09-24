"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import { getProviderDiagnosticAction } from "@/app/(dashboard)/usuarios/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { ProviderDiagnosticView } from "./provider-diagnostic-view";

export interface ProviderDiagnosticClientProps {
  id: string | number;
}

interface DiagnosticState {
  data: ProviderDiagnostic | null;
  isLoading: boolean;
  error: string | null;
  isForbidden: boolean;
  isNotFound: boolean;
}

function DiagnosticLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="mb-4 block size-8 rounded-full border-2 border-[#147560]/20 border-t-[#147560] motion-safe:animate-spin"
      />
      <p className="text-sm font-medium text-[#1A2B48]/70">
        {translations.users.diagnostic.loading}
      </p>
    </div>
  );
}

function DiagnosticForbidden() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{translations.users.diagnostic.forbidden}</p>
    </div>
  );
}

function DiagnosticNotFound() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs"
    >
      <p className="text-base font-medium text-[#1A2B48]/80">
        {translations.users.diagnostic.notFound}
      </p>
    </div>
  );
}

function DiagnosticError({
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
          {translations.users.diagnostic.retry}
        </button>
      )}
    </div>
  );
}

function useProviderDiagnostic(id: string | number) {
  const [state, setState] = useState<DiagnosticState>({
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
      const result = await getProviderDiagnosticAction(id);
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
        error: translations.users.diagnostic.error,
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

export function ProviderDiagnosticClient({ id }: ProviderDiagnosticClientProps) {
  const { state, reload } = useProviderDiagnostic(id);

  if (state.isLoading) {
    return <DiagnosticLoading />;
  }

  if (state.isForbidden) {
    return <DiagnosticForbidden />;
  }

  if (state.isNotFound) {
    return <DiagnosticNotFound />;
  }

  if (state.error) {
    return <DiagnosticError error={state.error} onRetry={reload} />;
  }

  if (!state.data) {
    return <DiagnosticNotFound />;
  }

  return <ProviderDiagnosticView diagnostic={state.data} />;
}
