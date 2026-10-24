import { useCallback, useEffect, useRef, useState } from "react";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import { translations } from "@/infrastructure/i18n/translations";

export interface UseAuditedChatDialogStateProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFetchConversation?: (cursor?: string) => Promise<AuditedConversationResult>;
}

interface DialogState {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isForbidden: boolean;
  readonly conversationResult: AuditedConversationResult | null;
}

const initialDialogState: DialogState = {
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

  const handleClose = () => {
    requestGeneration.current += 1;
    pending.current = false;
    setState(initialDialogState);
    onClose();
  };

  const loadPage = useCallback(async (cursor?: string) => {
    if (pending.current) return;
    pending.current = true;
    const generation = ++requestGeneration.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }));
    try {
      const page = onFetchConversation
        ? await (cursor ? onFetchConversation(cursor) : onFetchConversation())
        : { items: [], total: 0 };
      if (generation !== requestGeneration.current) return;
      setState((prev) => ({
        ...prev,
        conversationResult: appendPage(cursor ? prev.conversationResult : null, page),
        isLoading: false,
      }));
    } catch (error: unknown) {
      if (generation !== requestGeneration.current) return;
      setState((prev) => ({ ...prev, ...describeError(error), isLoading: false }));
    } finally {
      if (generation === requestGeneration.current) pending.current = false;
    }
  }, [onFetchConversation]);

  useEffect(() => {
    if (isOpen) void loadPage();
    else setState(initialDialogState);
    return () => {
      requestGeneration.current += 1;
      pending.current = false;
    };
  }, [isOpen, loadPage]);

  return {
    ...state,
    handleClose,
    handleLoadMore: () => state.conversationResult?.nextCursor ? loadPage(state.conversationResult.nextCursor) : Promise.resolve(),
    handleRetry: () => loadPage(state.conversationResult?.nextCursor ?? undefined),
  };
}
