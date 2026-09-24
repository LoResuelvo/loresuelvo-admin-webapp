import type { PaymentStatus } from "./types";

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; container: string; dot: string; helper?: string }
> = {
  approved: {
    label: "Aprobado",
    container: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pendiente",
    container: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    helper: "No computado como cobro acreditado",
  },
  rejected: {
    label: "Rechazado",
    container: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Cancelado",
    container: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
};

export function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <div className={`inline-flex flex-col items-start gap-0.5 ${className}`.trim()}>
      <span
        data-testid="payment-status-badge"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.container}`}
      >
        <span aria-hidden="true" className={`size-1.5 rounded-full ${config.dot}`} />
        <span>{config.label}</span>
      </span>
      {config.helper && (
        <span className="text-[11px] text-amber-700 font-normal">
          {config.helper}
        </span>
      )}
    </div>
  );
}
