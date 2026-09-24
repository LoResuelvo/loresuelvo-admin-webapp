"use client";

import type { Category } from "@/domain/categories/category";
import type { CategoryImpact } from "@/domain/categories/category-impact";
import { Modal } from "@/components/ui/modal";
import { translations } from "@/infrastructure/i18n/translations";

export interface DeactivateCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  impact: CategoryImpact | null;
  isLoadingImpact?: boolean;
  impactError?: string | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 motion-safe:animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-amber-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}

function DeactivateModalLoading() {
  const copy = translations.categories.deactivateModal;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 rounded-xl bg-[#F4F1EE]/50 p-6 text-sm text-[#1A2B48]/70"
    >
      <SpinnerIcon />
      <span>{copy.loading}</span>
    </div>
  );
}

function DeactivateModalBlockingAlert({ ordersCount }: { ordersCount: number }) {
  const copy = translations.categories.deactivateModal;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <WarningIcon />
      <div className="space-y-1">
        <p className="font-medium">{copy.blockingWarning(ordersCount)}</p>
      </div>
    </div>
  );
}

function DeactivateModalContent({
  impact,
  categoryName,
}: {
  impact: CategoryImpact;
  categoryName: string;
}) {
  const copy = translations.categories.deactivateModal;
  const isBlocked = impact.activeOrdersCount > 0 || !impact.canDeactivate;

  if (isBlocked) {
    return <DeactivateModalBlockingAlert ordersCount={impact.activeOrdersCount} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#1A2B48]/80">
        ¿Estás seguro de que deseas desactivar el rubro <strong>{categoryName}</strong>?
      </p>
      <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/30 p-4 text-sm text-[#1A2B48]/70">
        {impact.providerCount > 0
          ? copy.impactNotice(impact.providerCount)
          : copy.noProvidersNotice}
      </div>
    </div>
  );
}

interface DeactivateModalFooterProps {
  isBlocked: boolean;
  isSubmitting: boolean;
  isLoadingImpact: boolean;
  hasImpact: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeactivateModalFooter({
  isBlocked,
  isSubmitting,
  isLoadingImpact,
  hasImpact,
  onClose,
  onConfirm,
}: DeactivateModalFooterProps) {
  const copy = translations.categories.deactivateModal;
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="rounded-xl px-4 py-2 text-sm font-medium text-[#1A2B48]/70 transition-colors hover:bg-[#F4F1EE] hover:text-[#1A2B48] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {copy.cancelButton}
      </button>
      {!isBlocked && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting || isLoadingImpact || !hasImpact}
          aria-busy={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          {isSubmitting && <SpinnerIcon />}
          <span>{isSubmitting ? copy.confirmingButton : copy.confirmButton}</span>
        </button>
      )}
    </div>
  );
}

export function DeactivateCategoryModal({
  isOpen,
  category,
  impact,
  isLoadingImpact = false,
  impactError = null,
  onClose,
  onConfirm,
  isSubmitting = false,
  error = null,
}: DeactivateCategoryModalProps) {
  const copy = translations.categories.deactivateModal;
  const isBlocked = Boolean(impact && (impact.activeOrdersCount > 0 || !impact.canDeactivate));

  const handleConfirm = async () => {
    if (!category || isBlocked || isLoadingImpact || isSubmitting) return;
    await onConfirm(category.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={copy.title}
      closeAriaLabel={copy.closeAriaLabel}
    >
      <div className="space-y-4">
        {(error || impactError) && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error || impactError}
          </div>
        )}

        {isLoadingImpact && <DeactivateModalLoading />}

        {!isLoadingImpact && impact && category && (
          <DeactivateModalContent impact={impact} categoryName={category.name} />
        )}

        <DeactivateModalFooter
          isBlocked={isBlocked}
          isSubmitting={isSubmitting}
          isLoadingImpact={isLoadingImpact}
          hasImpact={Boolean(impact)}
          onClose={onClose}
          onConfirm={handleConfirm}
        />
      </div>
    </Modal>
  );
}

