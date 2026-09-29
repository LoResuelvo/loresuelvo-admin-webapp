"use client";

import { useId, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import type { InfractionCategory, ReviewModerationItem } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";

export interface ModerateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewModerationItem | null;
  onSubmit: (data: { category: InfractionCategory; reason: string }) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const infractionOptions = [
  { value: "abusive_language", labelKey: "abusive_language" },
  { value: "personal_data", labelKey: "personal_data" },
  { value: "spam", labelKey: "spam" },
  { value: "off_topic", labelKey: "off_topic" },
] as const;

function ReviewSnippet({ review }: { review: ReviewModerationItem }) {
  const copy = translations.moderation;
  return (
    <div className="rounded-xl bg-[#F4F1EE]/60 p-3 text-xs text-[#536176] space-y-1">
      <p><strong className="text-[#1A2B48]">{copy.table.author}:</strong> {review.authorName}</p>
      <p className="line-clamp-2 italic">&ldquo;{review.comment}&rdquo;</p>
    </div>
  );
}

interface CategorySelectProps {
  id: string;
  errorId: string;
  value: InfractionCategory | "";
  error: string | null;
  disabled: boolean;
  onChange: (val: string) => void;
}

function CategorySelect({ id, errorId, value, error, disabled, onChange }: CategorySelectProps) {
  const copy = translations.moderation;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2B48]">{copy.modal.categoryLabel}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#1A2B48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#147560] disabled:bg-gray-100 ${
          error ? "border-rose-500" : "border-[#1A2B48]/20"
        }`}
      >
        <option value="">{copy.modal.categoryPlaceholder}</option>
        {infractionOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{copy.infractions[opt.labelKey]}</option>
        ))}
      </select>
      {error && <p id={errorId} role="alert" className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

interface ReasonTextareaProps {
  id: string;
  value: string;
  disabled: boolean;
  onChange: (val: string) => void;
}

function ReasonTextarea({ id, value, disabled, onChange }: ReasonTextareaProps) {
  const copy = translations.moderation;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2B48]">{copy.modal.reasonLabel}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder={copy.modal.reasonPlaceholder}
        className="w-full rounded-xl border border-[#1A2B48]/20 bg-white px-3 py-2 text-sm text-[#1A2B48] placeholder-[#1A2B48]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#147560] disabled:bg-gray-100 resize-none"
      />
    </div>
  );
}

interface ModalFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

function ModalFooter({ isSubmitting, onCancel }: ModalFooterProps) {
  const copy = translations.moderation;
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="rounded-xl border border-[#1A2B48]/20 px-4 py-2 text-sm font-medium text-[#1A2B48] transition-colors hover:bg-[#F4F1EE] disabled:opacity-50"
      >
        {copy.modal.cancel}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] disabled:opacity-50"
      >
        {isSubmitting ? copy.modal.submitting : copy.modal.confirm}
      </button>
    </div>
  );
}

function useModerateForm(
  onSubmit: (data: { category: InfractionCategory; reason: string }) => Promise<void> | void,
  onClose: () => void,
  isSubmitting: boolean,
) {
  const [category, setCategory] = useState<InfractionCategory | "">("");
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const copy = translations.moderation;

  const handleCancel = () => {
    if (isSubmitting) return;
    setCategory("");
    setReason("");
    setValidationError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category) {
      setValidationError(copy.modal.errors.categoryRequired);
      return;
    }
    setValidationError(null);
    await onSubmit({ category, reason: reason.trim() });
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val as InfractionCategory | "");
    if (validationError) setValidationError(null);
  };

  return { category, reason, setReason, validationError, handleCancel, handleSubmit, handleCategoryChange };
}

interface ModerateReviewFormProps {
  review: ReviewModerationItem | null;
  onSubmit: (data: { category: InfractionCategory; reason: string }) => Promise<void> | void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
  onRetry?: () => void;
}

function ModerateReviewForm({
  review,
  onSubmit,
  onClose,
  isSubmitting,
  error,
  onRetry,
}: ModerateReviewFormProps) {
  const categoryId = useId();
  const reasonId = useId();
  const errorId = useId();
  const form = useModerateForm(onSubmit, onClose, isSubmitting);

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          <span>{error}</span>
          <button
            type={onRetry ? "button" : "submit"}
            onClick={onRetry}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
          >
            {translations.moderation.retry}
          </button>
        </div>
      )}
      {review && <ReviewSnippet review={review} />}
      <CategorySelect
        id={categoryId}
        errorId={errorId}
        value={form.category}
        error={form.validationError}
        disabled={isSubmitting}
        onChange={form.handleCategoryChange}
      />
      <ReasonTextarea
        id={reasonId}
        value={form.reason}
        disabled={isSubmitting}
        onChange={form.setReason}
      />
      <ModalFooter isSubmitting={isSubmitting} onCancel={form.handleCancel} />
    </form>
  );
}

export function ModerateReviewModal({
  isOpen,
  onClose,
  review,
  onSubmit,
  isSubmitting = false,
  error = null,
  onRetry,
}: ModerateReviewModalProps) {
  const copy = translations.moderation;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={copy.modal.title}>
      <ModerateReviewForm
        review={review}
        onSubmit={onSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        error={error}
        onRetry={onRetry}
      />
    </Modal>
  );
}
