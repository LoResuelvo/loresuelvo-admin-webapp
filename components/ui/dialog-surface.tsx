"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRef, type ComponentProps } from "react";

/** Shared modal behavior; Radix owns trapping, dismissal, isolation and scroll lock. */
type DialogSurfaceProps = ComponentProps<typeof Dialog.Content> & { overlayClassName?: string };

export function DialogSurface({ children, overlayClassName = "backdrop-blur-xs", ...props }: DialogSurfaceProps) {
  const previousFocus = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${overlayClassName}`}
        data-testid="modal-backdrop"
      />
      <Dialog.Content
        aria-modal="true"
        aria-describedby={undefined}
        onOpenAutoFocus={() => {
          previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(event) => {
          // Modal callers use external triggers rather than Dialog.Trigger.
          if (previousFocus.current?.isConnected) {
            event.preventDefault();
            previousFocus.current.focus();
          }
        }}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
