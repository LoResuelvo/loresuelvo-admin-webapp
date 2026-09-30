import { translations } from "@/infrastructure/i18n/translations";

import type { PeriodOption } from "@/domain/metrics/funnel-date-range";
export { computeDateRange, type PeriodOption } from "@/domain/metrics/funnel-date-range";

export interface CategoryOption {
  readonly id: number;
  readonly name: string;
}

export interface FunnelFiltersBarProps {
  selectedPeriod?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
  categoryOptions?: readonly CategoryOption[];
  fromDate?: string;
  toDate?: string;
  onFromDateChange?: (date: string) => void;
  onToDateChange?: (date: string) => void;
  onApplyFilters?: () => void;
  className?: string;
}

function PeriodFilterSelect({
  selectedPeriod,
  onPeriodChange,
}: {
  selectedPeriod: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
}) {
  const { filters } = translations.metrics;
  return (
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
  );
}

function CategoryFilterSelect({
  selectedCategoryId,
  onCategoryChange,
  categoryOptions,
}: {
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
  categoryOptions: readonly CategoryOption[];
}) {
  const categoryLabel = "Rubro";
  const allLabel = "Todos los rubros";
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="metrics-category-select"
        className="text-sm font-medium text-[#1A2B48]"
      >
        {categoryLabel}
      </label>
      <select
        id="metrics-category-select"
        data-testid="metrics-category-select"
        aria-label={categoryLabel}
        value={selectedCategoryId ?? ""}
        onChange={(e) =>
          onCategoryChange?.(e.target.value ? Number(e.target.value) : "")
        }
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{allLabel}</option>
        {categoryOptions.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRangeInputs({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: {
  fromDate?: string;
  toDate?: string;
  onFromDateChange?: (date: string) => void;
  onToDateChange?: (date: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="metrics-from-date"
          className="text-sm font-medium text-[#1A2B48]"
        >
          Desde
        </label>
        <input
          id="metrics-from-date"
          data-testid="metrics-from-date"
          type="date"
          aria-label="Fecha desde"
          value={fromDate ?? ""}
          onChange={(e) => onFromDateChange?.(e.target.value)}
          className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="metrics-to-date"
          className="text-sm font-medium text-[#1A2B48]"
        >
          Hasta
        </label>
        <input
          id="metrics-to-date"
          data-testid="metrics-to-date"
          type="date"
          aria-label="Fecha hasta"
          value={toDate ?? ""}
          onChange={(e) => onToDateChange?.(e.target.value)}
          className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        />
      </div>
    </div>
  );
}

function ApplyFiltersButton({ onApply }: { onApply?: () => void }) {
  return (
    <button
      type="button"
      data-testid="metrics-apply-filters"
      aria-label="Aplicar filtros"
      onClick={onApply}
      className="rounded-xl bg-[#147560] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#115e4d] focus:outline-hidden focus:ring-2 focus:ring-[#147560] focus:ring-offset-2"
    >
      Aplicar filtros
    </button>
  );
}

export function FunnelFiltersBar({
  selectedPeriod = "7d",
  onPeriodChange,
  selectedCategoryId = "",
  onCategoryChange,
  categoryOptions = [],
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApplyFilters,
  className = "",
}: FunnelFiltersBarProps) {
  return (
    <div
      data-testid="funnel-filters-bar"
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-4 shadow-xs ${className}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-4">
        <PeriodFilterSelect
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
        />
        <CategoryFilterSelect
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={onCategoryChange}
          categoryOptions={categoryOptions}
        />
        <DateRangeInputs
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
        />
      </div>
      <ApplyFiltersButton onApply={onApplyFilters} />
    </div>
  );
}
