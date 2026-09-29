"use client";

interface ResolutionModalFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
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

export function ResolutionModalFooter({
  isSubmitting,
  onCancel,
  cancelLabel,
  submitLabel,
  submittingLabel,
}: ResolutionModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A2B48]/10">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="rounded-xl px-4 py-2 text-sm font-medium text-[#1A2B48]/70 transition-colors hover:bg-[#F4F1EE] hover:text-[#1A2B48] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <SpinnerIcon />}
        <span>{isSubmitting ? submittingLabel : submitLabel}</span>
      </button>
    </div>
  );
}
