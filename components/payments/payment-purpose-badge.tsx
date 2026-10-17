import type { PaymentPurpose } from "./types";
import { translations } from "@/infrastructure/i18n/translations";

export interface PaymentPurposeBadgeProps {
  purpose: PaymentPurpose;
  className?: string;
}

const purposeConfig: Record<
  PaymentPurpose,
  { container: string }
> = {
  booking_deposit: {
    container: "bg-blue-50 text-blue-700 border-blue-200",
  },
  service_balance: {
    container: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

export function PaymentPurposeBadge({
  purpose,
  className = "",
}: PaymentPurposeBadgeProps) {
  const config = purposeConfig[purpose];
  const label = translations.payments.purposes[purpose];

  return (
    <span
      data-testid="payment-purpose-badge"
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.container} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
