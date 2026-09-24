import { useState } from "react";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import { translations } from "@/infrastructure/i18n/translations";

export interface UseAuditedChatDialogStateProps {
  readonly onClose: () => void;
  readonly onFetchConversation?: (reason: string) => Promise<AuditedConversationResult>;
}

export function useAuditedChatDialogState({
  onClose,
  onFetchConversation,
}: UseAuditedChatDialogStateProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationResult, setConversationResult] =
    useState<AuditedConversationResult | null>(null);

  const handleClose = () => {
    setSelectedReason("");
    setValidationError(null);
    setIsLoading(false);
    setError(null);
    setConversationResult(null);
    onClose();
  };

  const handleConfirmAccess = async () => {
    const trimmed = selectedReason.trim();
    if (!trimmed) {
      setValidationError(translations.operations.chat.validationError);
      return;
    }
    setValidationError(null);
    setIsLoading(true);
    setError(null);
    try {
      if (onFetchConversation) {
        const result = await onFetchConversation(trimmed);
        setConversationResult(result);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : translations.operations.chat.error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedReason,
    validationError,
    isLoading,
    error,
    conversationResult,
    handleClose,
    handleConfirmAccess,
    handleReasonChange: (val: string) => {
      setSelectedReason(val);
      if (validationError && val) setValidationError(null);
    },
    handleClearError: () => setError(null),
  };
}
