import type { AuditAction } from "@/domain/audit/audit-log";
import { translations } from "@/infrastructure/i18n/translations";

export interface AuditFiltersState {
  action?: AuditAction | "";
  operator?: string;
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

function ActionFilterSelect({
  value,
  onChange,
}: {
  value: AuditAction | "";
  onChange: (action: AuditAction | "") => void;
}) {
  const copy = translations.audit;
  return (
    <div className="flex flex-col gap-1.5 sm:w-64">
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

export function AuditFiltersBar({
  filters,
  onChange,
  className = "",
}: AuditFiltersBarProps) {
  const copy = translations.audit;

  const handleActionChange = (action: AuditAction | "") => {
    onChange({ ...filters, action });
  };

  const handleClear = () => {
    onChange({ action: "", operator: "" });
  };

  const hasActiveFilters = Boolean(filters.action || filters.operator);

  return (
    <div
      role="search"
      aria-label="Filtros de auditoría"
      className={`flex flex-col gap-3 rounded-2xl border border-[#1A2B48]/10 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <ActionFilterSelect
          value={filters.action ?? ""}
          onChange={handleActionChange}
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="self-start text-xs font-medium text-[#536176] hover:text-[#1A2B48] sm:self-center"
        >
          {copy.filters.clear}
        </button>
      )}
    </div>
  );
}
