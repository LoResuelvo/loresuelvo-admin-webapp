"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { translations } from "@/infrastructure/i18n/translations";
import type { PaymentIntentSummary } from "./types";
import { PaymentFinancialDetails } from "./payment-financial-details";

interface PaymentDetailsDialogProps {
  payment: PaymentIntentSummary;
}

export function PaymentDetailsDialog({ payment }: PaymentDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const copy = translations.payments;

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="rounded-md text-left font-medium text-[#147560] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {copy.table.showDetails}
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={copy.detail.title}
        closeAriaLabel={copy.detail.close}
        className="sm:max-w-3xl"
      >
        <PaymentFinancialDetails payment={payment} />
      </Modal>
    </>
  );
}
