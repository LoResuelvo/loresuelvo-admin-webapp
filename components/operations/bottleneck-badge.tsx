export type BottleneckType =
  | "pending_proposal_24h"
  | "pending_booking_deposit"
  | "scheduled_today"
  | "delayed_service"
  | "pending_final_payment"
  | "stalled"
  | "none";

export interface BottleneckBadgeProps {
  bottleneck: BottleneckType;
  className?: string;
}

const bottleneckConfig: Record<
  BottleneckType,
  { label: string; container: string; dot: string }
> = {
  pending_proposal_24h: {
    label: "Propuesta demorada > 24h",
    container: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  pending_booking_deposit: {
    label: "Pago de seña pendiente",
    container: "bg-orange-50 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
  },
  scheduled_today: {
    label: "Agendado para hoy",
    container: "bg-blue-50 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
  },
  delayed_service: {
    label: "Servicio demorado",
    container: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
  pending_final_payment: {
    label: "Pago final pendiente",
    container: "bg-purple-50 text-purple-800 border-purple-200",
    dot: "bg-purple-500",
  },
  stalled: {
    label: "Estancada > 24h",
    container: "bg-red-50 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
  none: {
    label: "Al día",
    container: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export function BottleneckBadge({ bottleneck, className = "" }: BottleneckBadgeProps) {
  const config = bottleneckConfig[bottleneck] ?? bottleneckConfig.none;

  return (
    <span
      data-testid="bottleneck-badge"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.container} ${className}`.trim()}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
