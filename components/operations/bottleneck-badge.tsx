import type { BottleneckType } from "@/domain/operations/operation-summary";
import { translations } from "@/infrastructure/i18n/translations";

export type { BottleneckType };

export interface BottleneckBadgeProps {
  bottleneck: BottleneckType;
  className?: string;
}

const bottleneckConfig: Record<
  BottleneckType,
  { container: string; dot: string }
> = {
  request_pending_over_24h: {
    container: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  booking_deadline_passed: {
    container: "bg-orange-50 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
  },
  scheduled_today: {
    container: "text-[#536176]",
    dot: "bg-[#82938b]",
  },
  delayed: {
    container: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
  pending_final_payment: {
    container: "text-amber-800",
    dot: "bg-amber-500",
  },
  stalled: {
    container: "bg-red-50 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
  none: {
    container: "text-[#536176]",
    dot: "bg-[#82938b]",
  },
};

export function BottleneckBadge({ bottleneck, className = "" }: BottleneckBadgeProps) {
  const config = bottleneckConfig[bottleneck] ?? bottleneckConfig.none;
  const label = translations.operations.bottleneck[bottleneck] ?? translations.operations.bottleneck.none;

  return (
    <span
      data-testid="bottleneck-badge"
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.container} ${className}`.trim()}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${config.dot}`} />
      <span>{label}</span>
    </span>
  );
}
