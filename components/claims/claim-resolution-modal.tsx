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

export type ResolutionType =
  | "favor_consumer"
  | "favor_provider"
  | "mutual_agreement"
  | "dismissed";

export interface ClaimResolutionFormData {
  resolutionType: ResolutionType;
  reason: string;
  compensationAmountCents?: number | null;
}

export interface ClaimResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClaimResolutionFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
}

interface ClaimResolutionFormProps {
  onClose: () => void;
  onSubmit: (data: ClaimResolutionFormData) => Promise<void> | void;
  isSubmitting: boolean;
  error: string | null;
}

function useResolutionForm(
  onSubmit: (data: ClaimResolutionFormData) => Promise<void> | void,
  onClose: () => void,
  isSubmitting: boolean,
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setValidationError(copy.errors.reasonRequired);
      return;
    }

    setValidationError(null);
    const cents = compensationAmount ? Math.round(Number(compensationAmount) * 100) : null;
    await onSubmit({
      resolutionType,
      reason: trimmedReason,
      compensationAmountCents: Number.isFinite(cents) ? cents : null,
    });
  };

  return {
    resolutionType,
    setResolutionType,
    reason,
    setReason,
    compensationAmount,
    setCompensationAmount,
    validationError,
    handleClose,
    handleSubmit,
  };
}

function ClaimResolutionForm({
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: ClaimResolutionFormProps) {
  const ids = { type: useId(), reason: useId(), comp: useId(), error: useId() };
  const form = useResolutionForm(onSubmit, onClose, isSubmitting);
  const copy = translations.claims.resolution;

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
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
        onChange={form.setReason}
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
      />
    </Modal>
  );
}
