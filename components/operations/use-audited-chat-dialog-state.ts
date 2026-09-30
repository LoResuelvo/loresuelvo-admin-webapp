import { useEffect, useRef, useState } from "react";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import { translations } from "@/infrastructure/i18n/translations";

export interface UseAuditedChatDialogStateProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFetchConversation?: (reason: string, cursor?: string) => Promise<AuditedConversationResult>;
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

function appendPage(previous: AuditedConversationResult | null, page: AuditedConversationResult): AuditedConversationResult {
  const messages = new Map((previous?.items ?? []).map((message) => [message.id, message]));
  for (const message of page.items) messages.set(message.id, message);
  return {
    items: [...messages.values()],
    total: messages.size,
    nextCursor: page.nextCursor,
    sharedConversation: page.sharedConversation,
  };
}

function describeError(error: unknown) {
  const message = error instanceof Error ? error.message : translations.operations.chat.error;
  const flagged = typeof error === "object" && error !== null && "isForbidden" in error && error.isForbidden === true;
  return { error: message, isForbidden: flagged || message === translations.operations.chat.forbidden };
}

export function useAuditedChatDialogState({ isOpen, onClose, onFetchConversation }: UseAuditedChatDialogStateProps) {
  const [state, setState] = useState<DialogState>(initialDialogState);
  const requestGeneration = useRef(0);
  const pending = useRef(false);

  useEffect(() => {
    if (!isOpen) setState(initialDialogState);
    return () => {
      requestGeneration.current += 1;
      pending.current = false;
    };
  }, [isOpen]);

  const handleClose = () => {
    requestGeneration.current += 1;
    pending.current = false;
    setState(initialDialogState);
    onClose();
  };

  const loadPage = async (cursor?: string) => {
    if (pending.current) return;
    const reason = state.selectedReason.trim();
    if (!reason) {
      setState((prev) => ({ ...prev, validationError: translations.operations.chat.validationError }));
      return;
    }
    pending.current = true;
    const generation = ++requestGeneration.current;
    setState((prev) => ({ ...prev, validationError: null, isLoading: true, error: null, isForbidden: false }));
    try {
      const page = onFetchConversation
        ? await (cursor ? onFetchConversation(reason, cursor) : onFetchConversation(reason))
        : null;
      if (generation !== requestGeneration.current) return;
      setState((prev) => ({
        ...prev,
        conversationResult: page ? appendPage(cursor ? prev.conversationResult : null, page) : null,
        isLoading: false,
      }));
    } catch (error: unknown) {
      if (generation !== requestGeneration.current) return;
      setState((prev) => ({ ...prev, ...describeError(error), isLoading: false }));
    } finally {
      if (generation === requestGeneration.current) pending.current = false;
    }
  };

  return {
    ...state,
    handleClose,
    handleConfirmAccess: () => loadPage(),
    handleLoadMore: () => state.conversationResult?.nextCursor ? loadPage(state.conversationResult.nextCursor) : Promise.resolve(),
    handleRetry: () => loadPage(state.conversationResult?.nextCursor ?? undefined),
    handleReasonChange: (value: string) => setState((prev) => ({ ...prev, selectedReason: value, validationError: value ? null : prev.validationError })),
    handleClearError: () => setState((prev) => ({ ...prev, error: null, isForbidden: false })),
  };
}
