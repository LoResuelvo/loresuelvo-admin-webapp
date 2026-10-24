"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import type {
  InfractionCategory,
  ReviewModerationCommand,
  ReviewModerationDetail,
} from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import { ReviewDetailContent } from "./review-detail-content";

export interface ModerateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewModerationDetail | null;
  action?: ReviewModerationCommand["action"];
  isLoadingDetail?: boolean;
  onSubmit: (data: { category?: InfractionCategory }) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const infractionOptions = [
  { value: "abusive_language", labelKey: "abusive_language" },
  { value: "personal_data", labelKey: "personal_data" },
  { value: "spam_advertising", labelKey: "spam_advertising" },
  { value: "unrelated_content", labelKey: "unrelated_content" },
] as const;

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

interface ModalFooterProps {
  action: ReviewModerationCommand["action"];
  isSubmitting: boolean;
  isLoadingDetail: boolean;
  canSubmit: boolean;
  onCancel: () => void;
}

function ModalFooter({ action, isSubmitting, isLoadingDetail, canSubmit, onCancel }: ModalFooterProps) {
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
        disabled={isSubmitting || isLoadingDetail || !canSubmit}
        className="rounded-xl bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] disabled:opacity-50"
      >
        {isSubmitting
          ? action === "hide" ? copy.modal.submitting : copy.modal.restoring
          : action === "hide" ? copy.modal.confirm : copy.modal.restoreConfirm}
      </button>
    </div>
  );
}

function useModerateForm(
  action: ReviewModerationCommand["action"],
  reviewId: string | undefined,
  onSubmit: (data: { category?: InfractionCategory }) => Promise<void> | void,
  onClose: () => void,
  isSubmitting: boolean,
) {
  const [category, setCategory] = useState<InfractionCategory | "">("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const copy = translations.moderation;

  useEffect(() => {
    setCategory("");
    setValidationError(null);
  }, [action, reviewId]);

  const handleCancel = () => {
    if (isSubmitting) return;
    setCategory("");
    setValidationError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (action === "hide" && !category) {
      setValidationError(copy.modal.errors.categoryRequired);
      return;
    }
    setValidationError(null);
    await onSubmit({
      category: action === "hide" ? (category as InfractionCategory) : undefined,
    });
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val as InfractionCategory | "");
    setValidationError(null);
  };

  return { category, validationError, handleCancel, handleSubmit, handleCategoryChange };
}

interface ModerateReviewFormProps {
  review: ReviewModerationDetail | null;
  action: ReviewModerationCommand["action"];
  isLoadingDetail: boolean;
  onSubmit: (data: { category?: InfractionCategory }) => Promise<void> | void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
  onRetry?: () => void;
}

function ModerateReviewForm({
  review,
  action,
  isLoadingDetail,
  onSubmit,
  onClose,
  isSubmitting,
  error,
  onRetry,
}: ModerateReviewFormProps) {
  const categoryId = useId();
  const errorId = useId();
  const form = useModerateForm(action, review?.review.id, onSubmit, onClose, isSubmitting);

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          <span>{error}</span>
          {onRetry || review ? (
            <button
              type={onRetry ? "button" : "submit"}
              onClick={onRetry}
              disabled={isSubmitting || isLoadingDetail}
              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              {translations.moderation.retry}
            </button>
          ) : null}
        </div>
      )}
      {isLoadingDetail && (
        <div role="status" className="rounded-xl bg-[#F4F1EE]/60 p-4 text-sm text-[#536176]">
          {translations.moderation.modal.loadingDetail}
        </div>
      )}
      {review && <ReviewDetailContent review={review} />}
      {action === "hide" && (
        <CategorySelect
          id={categoryId}
          errorId={errorId}
          value={form.category}
          error={form.validationError}
          disabled={isSubmitting || isLoadingDetail}
          onChange={form.handleCategoryChange}
        />
      )}
      <ModalFooter
        action={action}
        isSubmitting={isSubmitting}
        isLoadingDetail={isLoadingDetail}
        canSubmit={Boolean(review)}
        onCancel={form.handleCancel}
      />
    </form>
  );
}

export function ModerateReviewModal({
  isOpen,
  onClose,
  review,
  action = "hide",
  isLoadingDetail = false,
  onSubmit,
  isSubmitting = false,
  error = null,
  onRetry,
}: ModerateReviewModalProps) {
  const copy = translations.moderation;
  const title = action === "hide" ? copy.modal.title : copy.modal.restoreTitle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-2xl">
      <ModerateReviewForm
        review={review}
        action={action}
        isLoadingDetail={isLoadingDetail}
        onSubmit={onSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        error={error}
        onRetry={onRetry}
      />
    </Modal>
  );
}
