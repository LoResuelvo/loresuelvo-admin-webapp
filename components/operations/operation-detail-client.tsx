"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import {
  getOperationDetailAction,
  getAuditedConversationAction,
} from "@/app/(dashboard)/operaciones/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { OperationHeader } from "./operation-header";
import { OperationTimeline } from "./operation-timeline";
import { OperationRequestCard } from "./operation-request-card";
import { OperationProposalCard } from "./operation-proposal-card";
import { OperationOrderCard } from "./operation-order-card";
import { OperationCompletionCard } from "./operation-completion-card";
import { OperationDetailSkeleton } from "./operation-detail-skeleton";
import { AuditedChatDialog } from "./audited-chat-dialog";

export interface OperationDetailClientProps {
  id: string;
}

function DetailAlert({
  message,
  description,
  borderColor,
  bgColor,
  textColor,
  onRetry,
  backLink,
}: {
  message: string;
  description?: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  onRetry?: () => void;
  backLink?: { href: string; label: string };
}) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border ${borderColor} ${bgColor} p-6 text-center ${textColor}`}
    >
      <p className="font-semibold text-lg">{message}</p>
      {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      {backLink && (
        <div className="mt-4">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#147560]/20 bg-white px-4 py-2 text-sm font-medium text-[#147560] shadow-2xs hover:bg-[#147560]/5 transition-colors"
          >
            {backLink.label}
          </Link>
        </div>
      )}
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
      setError(translations.operations.detail.error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOperation();
  }, [loadOperation]);

  return { operation, isLoading, error, isNotFound, isForbidden, retry: loadOperation };
}

function OperationDetailContent({
  operation,
}: {
  operation: UnifiedOperationDetail;
}) {
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  const handleFetchConversation = useCallback(
    async (reason: string) => {
      const result = await getAuditedConversationAction(operation.id, reason);
      if (!result.success) {
        const error = new Error(result.error);
        if (result.isForbidden) {
          (error as Error & { isForbidden?: boolean }).isForbidden = true;
        }
        throw error;
      }
      return result.data;
    },
    [operation.id],
  );

  const consumerFullName = `${operation.consumer.name} ${operation.consumer.surname}`.trim();
  const providerFullName = `${operation.provider.name} ${operation.provider.surname}`.trim();

  return (
    <div className="space-y-6">
      <OperationHeader
        id={operation.id}
        status={operation.status}
        category={operation.category}
        consumer={operation.consumer}
        provider={operation.provider}
        currentAddress={operation.currentAddress}
        onInspectChat={() => setIsChatDialogOpen(true)}
      />
      <OperationRequestCard request={operation.request} />
      <OperationProposalCard proposals={operation.proposals} />
      <OperationOrderCard order={operation.order} />
      <OperationCompletionCard
        completionReport={operation.order?.completionReport}
        review={operation.order?.review}
      />
      <OperationTimeline milestones={operation.timeline} />
      <AuditedChatDialog
        isOpen={isChatDialogOpen}
        onClose={() => setIsChatDialogOpen(false)}
        operationId={operation.id}
        consumerName={consumerFullName}
        providerName={providerFullName}
        onFetchConversation={handleFetchConversation}
      />
    </div>
  );
}

export function OperationDetailClient({ id }: OperationDetailClientProps) {
  const { operation, isLoading, error, isNotFound, isForbidden, retry } = useOperationDetail(id);

  if (isLoading) return <OperationDetailSkeleton />;

  if (isForbidden) {
    return (
      <DetailAlert
        message={error ?? translations.operations.detail.forbidden}
        description={translations.operations.detail.forbiddenDescription}
        borderColor="border-amber-200"
        bgColor="bg-amber-50"
        textColor="text-amber-800"
      />
    );
  }

  if (isNotFound) {
    return (
      <DetailAlert
        message={error ?? translations.operations.detail.notFound}
        description={translations.operations.detail.notFoundDescription}
        borderColor="border-slate-200"
        bgColor="bg-slate-50"
        textColor="text-slate-700"
        backLink={{
          href: ROUTES.operations,
          label: translations.operations.detail.backToList,
        }}
      />
    );
  }

  if (error) {
    return (
      <DetailAlert
        message={error}
        description={translations.operations.detail.errorDescription}
        borderColor="border-red-200"
        bgColor="bg-red-50"
        textColor="text-red-700"
        onRetry={retry}
      />
    );
  }

  if (!operation) return null;

  return <OperationDetailContent operation={operation} />;
}
