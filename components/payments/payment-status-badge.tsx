import type { PaymentStatus } from "./types";
import { translations } from "@/infrastructure/i18n/translations";

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusStyles: Record<PaymentStatus, { container: string; dot: string }> = {
  requires_checkout: {
    container: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  checkout_ready: {
    container: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  processing: {
    container: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  paid: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    container: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  expired: {
    container: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  cancelled: {
    container: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  refunded: {
    container: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  disputed: {
    container: "bg-orange-50 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
  },
  payment_mismatch: {
    container: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const copy = translations.payments;
  const config = statusStyles[status];

  return (
    <div className={`inline-flex flex-col items-start gap-0.5 ${className}`.trim()}>
      <span
        data-testid="payment-status-badge"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.container}`}
      >
        <span aria-hidden="true" className={`size-1.5 rounded-full ${config.dot}`} />
        <span>{copy.statuses[status]}</span>
      </span>
      {status !== "paid" && (
        <span className="text-[11px] text-amber-700 font-normal">
          {copy.checkout.notAccredited}
        </span>
      )}
    </div>
  );
}
