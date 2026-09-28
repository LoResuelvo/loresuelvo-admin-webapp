import { translations } from "@/infrastructure/i18n/translations";

export type PeriodOption = "7d" | "30d" | "90d";

export interface FunnelFiltersBarProps {
  selectedPeriod?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  className?: string;
}

export function computeDateRange(
  preset: PeriodOption,
  referenceDate: Date = new Date("2026-09-24T00:00:00Z"),
): { from: string; to: string } {
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const to = new Date(referenceDate);
  const from = new Date(referenceDate);
  from.setDate(to.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export function FunnelFiltersBar({
  selectedPeriod = "7d",
  onPeriodChange,
  className = "",
}: FunnelFiltersBarProps) {
  const { filters } = translations.metrics;

  return (
    <div
      data-testid="funnel-filters-bar"
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2">
        <label
          htmlFor="metrics-period-select"
          className="text-sm font-medium text-[#1A2B48]"
        >
          {filters.period.label}
        </label>
        <select
          id="metrics-period-select"
          data-testid="metrics-period-select"
          aria-label={filters.period.label}
          value={selectedPeriod}
          onChange={(e) => onPeriodChange?.(e.target.value as PeriodOption)}
          className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        >
          <option value="7d">{filters.period.last7Days}</option>
          <option value="30d">{filters.period.last30Days}</option>
          <option value="90d">{filters.period.last90Days}</option>
        </select>
      </div>
    </div>
  );
}
