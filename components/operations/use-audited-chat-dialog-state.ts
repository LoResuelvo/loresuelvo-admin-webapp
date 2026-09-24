import { useState } from "react";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import { translations } from "@/infrastructure/i18n/translations";

export interface UseAuditedChatDialogStateProps {
  readonly onClose: () => void;
  readonly onFetchConversation?: (reason: string) => Promise<AuditedConversationResult>;
}

interface DialogState {
  readonly selectedReason: string;
  readonly validationError: string | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isForbidden: boolean;
  readonly conversationResult: AuditedConversationResult | null;
}

const initialDialogState: DialogState = {
  selectedReason: "",
  validationError: null,
  isLoading: false,
  error: null,
  isForbidden: false,
  conversationResult: null,
};

export function useAuditedChatDialogState({
  onClose,
  onFetchConversation,
}: UseAuditedChatDialogStateProps) {
  const [state, setState] = useState<DialogState>(initialDialogState);

  const handleClose = () => {
    setState(initialDialogState);
    onClose();
  };

  const handleConfirmAccess = async () => {
    const trimmed = state.selectedReason.trim();
    if (!trimmed) {
      setState((prev) => ({ ...prev, validationError: translations.operations.chat.validationError }));
      return;
    }
    setState((prev) => ({ ...prev, validationError: null, isLoading: true, error: null, isForbidden: false }));
    try {
      const result = onFetchConversation ? await onFetchConversation(trimmed) : null;
      setState((prev) => ({ ...prev, conversationResult: result, isLoading: false }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : translations.operations.chat.error;
      const forbidden =
        (err as { isForbidden?: boolean })?.isForbidden === true ||
        message === translations.operations.chat.forbidden ||
        message.toLowerCase().includes("restringido");
      setState((prev) => ({ ...prev, error: message, isForbidden: forbidden, isLoading: false }));
    }
  };

  return {
    ...state,
    handleClose,
    handleConfirmAccess,
    handleReasonChange: (val: string) => {
      setState((prev) => ({
        ...prev,
        selectedReason: val,
        validationError: prev.validationError && val ? null : prev.validationError,
      }));
    },
    handleClearError: () => setState((prev) => ({ ...prev, error: null, isForbidden: false })),
  };
}

