import type { PaymentPurpose } from "./types";

export interface PaymentPurposeBadgeProps {
  purpose: PaymentPurpose;
  className?: string;
}

const purposeConfig: Record<
  PaymentPurpose,
  { label: string; container: string }
> = {
  deposit: {
    label: "Seña",
    container: "bg-blue-50 text-blue-700 border-blue-200",
  },
  balance: {
    label: "Saldo",
    container: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

export function PaymentPurposeBadge({
  purpose,
  className = "",
}: PaymentPurposeBadgeProps) {
  const config = purposeConfig[purpose] ?? purposeConfig.deposit;

  return (
    <span
      data-testid="payment-purpose-badge"
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.container} ${className}`.trim()}
    >
      {config.label}
    </span>
  );
}
