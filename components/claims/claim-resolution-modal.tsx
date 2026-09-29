"use client";

import { useId, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { translations } from "@/infrastructure/i18n/translations";
import { ResolutionModalFooter } from "./claim-resolution-modal-footer";
import {
  ResolutionTypeSelect,
  ResolutionReasonTextarea,
  ResolutionCompensationInput,
} from "./claim-resolution-modal-fields";
import type { ResolutionType, ResolutionInput } from "@/domain/claims/claim";

export type { ResolutionType };
export type ClaimResolutionFormData = ResolutionInput;

export interface ClaimResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClaimResolutionFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

interface ClaimResolutionFormProps {
  onClose: () => void;
  onSubmit: (data: ClaimResolutionFormData) => Promise<void> | void;
  isSubmitting: boolean;
  error: string | null;
  onRetry?: () => void;
}

function parseCompensationCents(amount: string): number | null {
  if (!amount) return null;
  const cents = Math.round(Number(amount) * 100);
  return Number.isFinite(cents) ? cents : null;
}

function useResolutionForm(
  onSubmit: (data: ClaimResolutionFormData) => Promise<void> | void,
  onClose: () => void,
  isSubmitting: boolean,
  onRetry?: () => void,
) {
  const [resolutionType, setResolutionType] = useState<ResolutionType>("favor_consumer");
  const [reason, setReason] = useState("");
  const [compensationAmount, setCompensationAmount] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const copy = translations.claims.resolution;

  const handleClose = () => {
    if (isSubmitting) return;
    setReason("");
    setValidationError(null);
    onClose();
  };

  const submitWithCurrentValues = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setValidationError(copy.errors.reasonRequired);
      return;
    }
    setValidationError(null);
    await onSubmit({
      resolutionType,
      reason: trimmedReason,
      compensationAmountCents: parseCompensationCents(compensationAmount),
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitWithCurrentValues();
  };

  const handleRetry = () => (onRetry ? onRetry() : void submitWithCurrentValues());

  const handleReasonChange = (val: string) => {
    setReason(val);
    if (validationError) setValidationError(null);
  };

  return {
    resolutionType, setResolutionType,
    reason, handleReasonChange,
    compensationAmount, setCompensationAmount,
    validationError, handleClose, handleSubmit, handleRetry,
  };
}

function ClaimResolutionErrorAlert({
  error,
  onRetry,
  disabled,
}: {
  error: string;
  onRetry: () => void;
  disabled: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
    >
      <p>{error}</p>
      <div>
        <button
          type="button"
          onClick={onRetry}
          disabled={disabled}
          className="inline-flex items-center rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-rose-800 disabled:opacity-50"
        >
          {translations.claims.retry}
        </button>
      </div>
    </div>
  );
}

function ClaimResolutionForm({
  onClose,
  onSubmit,
  isSubmitting,
  error,
  onRetry,
}: ClaimResolutionFormProps) {
  const ids = { type: useId(), reason: useId(), comp: useId(), error: useId() };
  const form = useResolutionForm(onSubmit, onClose, isSubmitting, onRetry);
  const copy = translations.claims.resolution;

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      {error && (
        <ClaimResolutionErrorAlert
          error={error}
          onRetry={form.handleRetry}
          disabled={isSubmitting}
        />
      )}
      <ResolutionTypeSelect
        id={ids.type}
        value={form.resolutionType}
        onChange={form.setResolutionType}
        disabled={isSubmitting}
      />
      <ResolutionReasonTextarea
        id={ids.reason}
        errorId={ids.error}
        value={form.reason}
        onChange={form.handleReasonChange}
        error={form.validationError}
        disabled={isSubmitting}
      />
      <ResolutionCompensationInput
        id={ids.comp}
        value={form.compensationAmount}
        onChange={form.setCompensationAmount}
        disabled={isSubmitting}
      />
      <ResolutionModalFooter
        isSubmitting={isSubmitting}
        onCancel={form.handleClose}
        cancelLabel={copy.cancelButton}
        submitLabel={copy.submitButton}
        submittingLabel={copy.submittingButton}
      />
    </form>
  );
}

export function ClaimResolutionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
  onRetry,
}: ClaimResolutionModalProps) {
  const copy = translations.claims.resolution;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={copy.modalTitle}
      closeAriaLabel={copy.closeAriaLabel}
    >
      <ClaimResolutionForm
        onClose={onClose}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
        onRetry={onRetry}
      />
    </Modal>
  );
}

