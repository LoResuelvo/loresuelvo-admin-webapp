import type { BottleneckType } from "@/domain/operations/operation-summary";
import { translations } from "@/infrastructure/i18n/translations";

const BOTTLENECK_OPTIONS: readonly BottleneckType[] = [
  "stalled",
  "pending_proposal_24h",
  "pending_booking_deposit",
  "scheduled_today",
  "delayed_service",
  "pending_final_payment",
  "none",
];

export interface OperationsFilterBarProps {
  selectedBottleneck?: BottleneckType | "";
  onBottleneckChange?: (bottleneck: BottleneckType | "") => void;
}

function BottleneckFilterSelect({
  selectedBottleneck,
  onBottleneckChange,
}: {
  selectedBottleneck?: BottleneckType | "";
  onBottleneckChange?: (bottleneck: BottleneckType | "") => void;
}) {
  const { filters, bottleneck: bottleneckTrans } = translations.operations;

  return (
    <div className="flex items-center">
      <label htmlFor="operations-bottleneck-filter" className="sr-only">
        {filters.bottleneck.label}
      </label>
      <select
        id="operations-bottleneck-filter"
        aria-label={filters.bottleneck.label}
        value={selectedBottleneck ?? ""}
        onChange={(e) => onBottleneckChange?.(e.target.value as BottleneckType | "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.bottleneck.all}</option>
        {BOTTLENECK_OPTIONS.map((key) => (
          <option key={key} value={key}>
            {bottleneckTrans[key]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function OperationsFilterBar({
  selectedBottleneck = "",
  onBottleneckChange,
}: OperationsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4" data-testid="operations-filter-bar">
      <BottleneckFilterSelect
        selectedBottleneck={selectedBottleneck}
        onBottleneckChange={onBottleneckChange}
      />
    </div>
  );
}
