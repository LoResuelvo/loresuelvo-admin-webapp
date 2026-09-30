import { translations } from "@/infrastructure/i18n/translations";

const STATUS_FILTERS: Record<string, string[]> = {
  job_request: ["pending", "accepted"],
  service_proposal: ["pending", "accepted", "rejected"],
  work_order: ["scheduled", "awaiting_payment", "paid"],
};

export interface ConsumerHistoryFiltersProps {
  selectedType?: string;
  selectedStatus?: string;
  onTypeChange?: (type: string) => void;
  onStatusChange?: (status: string) => void;
}

export function ConsumerHistoryFilters({
  selectedType = "all",
  selectedStatus = "all",
  onTypeChange,
  onStatusChange,
}: ConsumerHistoryFiltersProps) {
  const { filters, statuses } = translations.users.consumerDetail.history;
  const statusOptions = STATUS_FILTERS[selectedType] ?? [];

  return (
    <div
      data-testid="consumer-history-filters"
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center">
        <label htmlFor="consumer-history-type-filter" className="sr-only">
          {filters.typeLabel}
        </label>
        <select
          id="consumer-history-type-filter"
          aria-label={filters.typeLabel}
          value={selectedType}
          onChange={(e) => onTypeChange?.(e.target.value)}
          className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        >
          <option value="all">{filters.allTypes}</option>
          <option value="work_order">{filters.types.work_order}</option>
          <option value="service_proposal">{filters.types.service_proposal}</option>
          <option value="job_request">{filters.types.job_request}</option>
        </select>
      </div>

      <div className="flex items-center">
        <label htmlFor="consumer-history-status-filter" className="sr-only">
          {filters.statusLabel}
        </label>
        <select
          id="consumer-history-status-filter"
          aria-label={filters.statusLabel}
          value={selectedStatus}
          onChange={(e) => onStatusChange?.(e.target.value)}
          disabled={statusOptions.length === 0}
          className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        >
          <option value="all">{filters.allStatuses}</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statuses[status as keyof typeof statuses]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
