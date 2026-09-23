"use client";

import { useCallback, useEffect, useState } from "react";
import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import { getOperationDetailAction } from "@/app/(dashboard)/operaciones/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { OperationHeader } from "./operation-header";
import { OperationTimeline } from "./operation-timeline";
import { OperationRequestCard } from "./operation-request-card";

export interface OperationDetailClientProps {
  id: string;
}

function DetailLoading() {
  return (
    <div data-testid="operation-detail-skeleton" className="space-y-4 animate-pulse">
      <div className="h-44 rounded-2xl bg-[#F4F1EE]" />
    </div>
  );
}

function DetailAlert({
  message,
  borderColor,
  bgColor,
  textColor,
  onRetry,
}: {
  message: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border ${borderColor} ${bgColor} p-6 text-center ${textColor}`}
    >
      <p className="font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E]"
        >
          {translations.operations.retry}
        </button>
      )}
    </div>
  );
}

function useOperationDetail(id: string) {
  const [operation, setOperation] = useState<UnifiedOperationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const loadOperation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);
    setIsForbidden(false);
    try {
      const result = await getOperationDetailAction(id);
      if (result.success) {
        setOperation(result.data);
      } else {
        if (result.isNotFound) {
          setIsNotFound(true);
        } else if (result.isForbidden) {
          setIsForbidden(true);
        }
        setError(result.error);
      }
    } catch {
      setError(translations.operations.error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOperation();
  }, [loadOperation]);

  return { operation, isLoading, error, isNotFound, isForbidden, retry: loadOperation };
}

export function OperationDetailClient({ id }: OperationDetailClientProps) {
  const { operation, isLoading, error, isNotFound, isForbidden, retry } = useOperationDetail(id);

  if (isLoading) return <DetailLoading />;

  if (isForbidden) {
    return (
      <DetailAlert
        message={error ?? translations.operations.forbidden}
        borderColor="border-amber-200"
        bgColor="bg-amber-50"
        textColor="text-amber-800"
      />
    );
  }

  if (isNotFound) {
    return (
      <DetailAlert
        message={error ?? "La contratación solicitada no existe."}
        borderColor="border-slate-200"
        bgColor="bg-slate-50"
        textColor="text-slate-700"
      />
    );
  }

  if (error) {
    return (
      <DetailAlert
        message={error}
        borderColor="border-red-200"
        bgColor="bg-red-50"
        textColor="text-red-700"
        onRetry={retry}
      />
    );
  }

  if (!operation) return null;

  return (
    <div className="space-y-6">
      <OperationHeader
        id={operation.id}
        status={operation.status}
        category={operation.category}
        consumer={operation.consumer}
        provider={operation.provider}
        currentAddress={operation.currentAddress}
      />
      <OperationRequestCard request={operation.request} />
      <OperationTimeline milestones={operation.timeline} />
    </div>
  );
}
