import type { AuditAction } from "@/domain/audit/audit-log";
import { translations } from "@/infrastructure/i18n/translations";

export interface AuditFiltersState {
  action?: AuditAction | "";
  operator?: string;
  from?: string;
  to?: string;
}

export interface AuditFiltersBarProps {
  filters: AuditFiltersState;
  onChange: (filters: AuditFiltersState) => void;
  className?: string;
}

const ACTION_OPTIONS: Array<{ value: AuditAction; labelKey: keyof typeof translations.audit.actions }> = [
  { value: "chat_access", labelKey: "chat_access" },
  { value: "payment_reconcile", labelKey: "payment_reconcile" },
  { value: "category_create", labelKey: "category_create" },
  { value: "category_update", labelKey: "category_update" },
  { value: "category_deactivate", labelKey: "category_deactivate" },
  { value: "provider_status_change", labelKey: "provider_status_change" },
  { value: "claim_resolution", labelKey: "claim_resolution" },
  { value: "review_moderation", labelKey: "review_moderation" },
];

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-[#536176]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function ActionFilterSelect({
  value,
  onChange,
}: {
  value: AuditAction | "";
  onChange: (action: AuditAction | "") => void;
}) {
  const copy = translations.audit;
  return (
    <div className="flex flex-col gap-1.5 sm:w-56">
      <label htmlFor="audit-action-filter" className="sr-only">
        {copy.filters.actionLabel}
      </label>
      <select
        id="audit-action-filter"
        aria-label={copy.filters.actionLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as AuditAction | "")}
        className="h-10 rounded-xl border border-[#1A2B48]/10 bg-white px-3.5 text-sm text-[#1A2B48] focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{copy.filters.actionAll}</option>
        {ACTION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {copy.actions[opt.labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
}

function OperatorSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const copy = translations.audit;
  return (
    <div className="relative flex-1">
      <label htmlFor="audit-operator-search" className="sr-only">
        {copy.filters.operatorLabel}
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <SearchIcon />
      </div>
      <input
        id="audit-operator-search"
        type="search"
        aria-label={copy.filters.operatorLabel}
        placeholder={copy.filters.operatorPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-[#1A2B48]/10 bg-white pl-10 pr-3.5 text-sm text-[#1A2B48] placeholder-[#536176]/70 focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      />
    </div>
  );
}

function DateRangeFilterInputs({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
}) {
  const copy = translations.audit;
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="audit-date-from" className="sr-only">
          {copy.filters.dateFrom}
        </label>
        <input
          id="audit-date-from"
          type="date"
          aria-label={copy.filters.dateFrom}
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="h-10 rounded-xl border border-[#1A2B48]/10 bg-white px-3 text-sm text-[#1A2B48] focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        />
      </div>
      <span className="text-xs text-[#536176]">–</span>
      <div className="flex flex-col gap-1">
        <label htmlFor="audit-date-to" className="sr-only">
          {copy.filters.dateTo}
        </label>
        <input
          id="audit-date-to"
          type="date"
          aria-label={copy.filters.dateTo}
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="h-10 rounded-xl border border-[#1A2B48]/10 bg-white px-3 text-sm text-[#1A2B48] focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        />
      </div>
    </div>
  );
}

export function AuditFiltersBar({
  filters,
  onChange,
  className = "",
}: AuditFiltersBarProps) {
  const copy = translations.audit;
  const update = (patch: Partial<AuditFiltersState>) => onChange({ ...filters, ...patch });
  const handleClear = () => onChange({ action: "", operator: "", from: "", to: "" });
  const hasActiveFilters = Boolean(
    filters.action || filters.operator || filters.from || filters.to,
  );

  return (
    <div
      role="search"
      aria-label="Filtros de auditoría"
      className={`flex flex-col gap-3 rounded-2xl border border-[#1A2B48]/10 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between ${className}`.trim()}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <ActionFilterSelect
          value={filters.action ?? ""}
          onChange={(action) => update({ action })}
        />
        <OperatorSearchInput
          value={filters.operator ?? ""}
          onChange={(operator) => update({ operator })}
        />
        <DateRangeFilterInputs
          from={filters.from ?? ""}
          to={filters.to ?? ""}
          onFromChange={(from) => update({ from })}
          onToChange={(to) => update({ to })}
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="self-start text-xs font-medium text-[#536176] hover:text-[#1A2B48] lg:self-center"
        >
          {copy.filters.clear}
        </button>
      )}
    </div>
  );
}
