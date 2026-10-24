"use client";

import { Modal } from "@/components/ui/modal";
import type { ReviewModerationDetail } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import { ReviewDetailContent } from "./review-detail-content";

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewModerationDetail | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ReviewDetailsModal({
  isOpen,
  onClose,
  review,
  isLoading = false,
  error = null,
  onRetry,
}: ReviewDetailsModalProps) {
  const copy = translations.moderation;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={copy.modal.detailsTitle} className="max-w-2xl">
      {isLoading && (
        <div role="status" className="rounded-xl bg-[#F4F1EE]/60 p-4 text-sm text-[#536176]">
          {copy.modal.loadingDetail}
        </div>
      )}
      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
              {copy.retry}
            </button>
          )}
        </div>
      )}
      {review && <ReviewDetailContent review={review} />}
    </Modal>
  );
}
