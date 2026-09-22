"use client";

import { useEffect, useId, type ReactNode } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  closeAriaLabel?: string;
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function useModalKeyboardAndScroll(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  closeAriaLabel = "Cerrar modal",
}: ModalProps) {
  const titleId = useId();

  useModalKeyboardAndScroll(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#1A2B48]/10 text-[#1A2B48] focus:outline-none ${className}`.trim()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2B48]/10">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-[#1A2B48]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeAriaLabel}
            className="rounded-lg p-1.5 text-[#1A2B48]/60 transition-colors hover:bg-[#F4F1EE] hover:text-[#1A2B48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
