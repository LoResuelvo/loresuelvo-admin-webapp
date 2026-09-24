"use client";

import { Modal } from "@/components/ui/modal";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import { translations } from "@/infrastructure/i18n/translations";
import { AuditReasonSelector } from "./audit-reason-selector";
import { AuditedMessagesList } from "./audited-messages-list";
import { AuditedChatLoadingState } from "./audited-chat-loading-state";
import { useAuditedChatDialogState } from "./use-audited-chat-dialog-state";

export { AuditedChatLoadingState };

export interface AuditedChatDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly operationId: string;
  readonly consumerName?: string;
  readonly providerName?: string;
  readonly onFetchConversation?: (
    reason: string,
  ) => Promise<AuditedConversationResult>;
}

interface ReasonFormProps {
  readonly reason: string;
  readonly validationError: string | null;
  readonly onReasonChange: (reason: string) => void;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

function AuditedChatReasonForm({
  reason,
  validationError,
  onReasonChange,
  onClose,
  onConfirm,
}: ReasonFormProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#536176] leading-relaxed">
        {translations.operations.chat.dialogDescription}
      </p>
      <AuditReasonSelector
        value={reason}
        onChange={onReasonChange}
        error={validationError}
      />
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A2B48]/10">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[#1A2B48]/20 px-4 py-2 text-sm font-medium text-[#1A2B48] hover:bg-[#F4F1EE] transition-colors"
        >
          {translations.operations.chat.cancel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          data-testid="confirm-audit-access-button"
          className="inline-flex items-center justify-center rounded-xl bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {translations.operations.chat.confirmAccess}
        </button>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  readonly error: string;
  readonly isForbidden?: boolean;
  readonly onBack: () => void;
  readonly onRetry: () => void;
}

function AuditedChatErrorState({
  error,
  isForbidden = false,
  onBack,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 text-center space-y-3 ${
        isForbidden
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <p className="text-sm font-medium">{error}</p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            isForbidden
              ? "border border-amber-300 bg-white text-amber-800 hover:bg-amber-50"
              : "border border-red-300 bg-white text-red-800 hover:bg-red-50"
          }`}
        >
          {isForbidden ? translations.operations.chat.close : "Volver"}
        </button>
        {!isForbidden && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
          >
            {translations.operations.chat.retry}
          </button>
        )}
      </div>
    </div>
  );
}

interface SuccessViewProps {
  readonly result: AuditedConversationResult;
  readonly consumerName?: string;
  readonly providerName?: string;
  readonly onClose: () => void;
}

function AuditedChatSuccessView({
  result,
  consumerName,
  providerName,
  onClose,
}: SuccessViewProps) {
  return (
    <div className="space-y-4">
      <AuditedMessagesList
        messages={result.items}
        consumerName={consumerName}
        providerName={providerName}
      />
      <div className="flex items-center justify-between pt-3 border-t border-[#1A2B48]/10 text-xs text-[#536176]">
        <span>
          Total: {result.total} {result.total === 1 ? "mensaje" : "mensajes"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#1A2B48]/20 px-3 py-1.5 text-xs font-medium text-[#1A2B48] hover:bg-[#F4F1EE]"
        >
          {translations.operations.chat.close}
        </button>
      </div>
    </div>
  );
}

export function AuditedChatDialog({
  isOpen,
  onClose,
  consumerName,
  providerName,
  onFetchConversation,
}: AuditedChatDialogProps) {
  const {
    selectedReason,
    validationError,
    isLoading,
    error,
    isForbidden,
    conversationResult,
    handleClose,
    handleConfirmAccess,
    handleReasonChange,
    handleClearError,
  } = useAuditedChatDialogState({ onClose, onFetchConversation });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={translations.operations.chat.dialogTitle}
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {!conversationResult && !isLoading && !error && (
          <AuditedChatReasonForm
            reason={selectedReason}
            validationError={validationError}
            onReasonChange={handleReasonChange}
            onClose={handleClose}
            onConfirm={handleConfirmAccess}
          />
        )}
        {isLoading && <AuditedChatLoadingState />}
        {error && !isLoading && (
          <AuditedChatErrorState
            error={error}
            isForbidden={isForbidden}
            onBack={handleClearError}
            onRetry={handleConfirmAccess}
          />
        )}
        {conversationResult && !isLoading && (
          <AuditedChatSuccessView
            result={conversationResult}
            consumerName={consumerName}
            providerName={providerName}
            onClose={handleClose}
          />
        )}
      </div>
    </Modal>
  );
}
