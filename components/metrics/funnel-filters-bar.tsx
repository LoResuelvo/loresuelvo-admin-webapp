import { translations } from "@/infrastructure/i18n/translations";

export type PeriodOption = "7d" | "30d" | "90d";

export interface CategoryOption {
  readonly id: number;
  readonly name: string;
}

export const DEFAULT_CATEGORIES: readonly CategoryOption[] = [
  { id: 1, name: "Plomería" },
  { id: 2, name: "Electricidad" },
  { id: 3, name: "Gas" },
];

export interface FunnelFiltersBarProps {
  selectedPeriod?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
  categoryOptions?: readonly CategoryOption[];
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

export function FunnelFiltersBar({
  selectedPeriod = "7d",
  onPeriodChange,
  selectedCategoryId = "",
  onCategoryChange,
  categoryOptions = DEFAULT_CATEGORIES,
  className = "",
}: FunnelFiltersBarProps) {
  return (
    <div
      data-testid="funnel-filters-bar"
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-4 shadow-xs ${className}`}
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
      </div>
    </div>
  );
}
