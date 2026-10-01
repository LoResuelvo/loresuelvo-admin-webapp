"use client";

import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogSurface } from "./dialog-surface";

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

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  closeAriaLabel = "Cerrar modal",
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogSurface
        className={`fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl border border-[#1A2B48]/10 text-[#1A2B48] focus:outline-none max-h-[calc(100dvh-2rem)] overflow-y-auto ${className}`.trim()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2B48]/10">
          <Dialog.Title className="text-lg font-semibold tracking-tight text-[#1A2B48]">
            {title}
          </Dialog.Title>
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
      </DialogSurface>
    </Dialog.Root>
  );
}
