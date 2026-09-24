import type { PaymentPurpose, PaymentStatus } from "./types";
import { translations } from "@/infrastructure/i18n/translations";

const PURPOSE_OPTIONS: readonly PaymentPurpose[] = ["deposit", "balance"];
const STATUS_OPTIONS: readonly PaymentStatus[] = [
  "approved",
  "pending",
  "rejected",
  "cancelled",
];

export interface PaymentsFiltersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedPurpose?: PaymentPurpose | "";
  onPurposeChange?: (purpose: PaymentPurpose | "") => void;
  selectedStatus?: PaymentStatus | "";
  onStatusChange?: (status: PaymentStatus | "") => void;
  className?: string;
}

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

function PaymentSearchInput({
  searchQuery,
  onSearchChange,
}: {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}) {
  const { filters } = translations.payments;

  return (
    <div className="relative w-full max-w-sm">
      <label htmlFor="payments-search" className="sr-only">
        {filters.search.label}
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon />
      </div>
      <input
        id="payments-search"
        type="search"
        role="searchbox"
        aria-label={filters.search.label}
        value={searchQuery ?? ""}
        onChange={(e) => onSearchChange?.(e.target.value)}
        placeholder={filters.search.placeholder}
        className="w-full rounded-xl border border-[#1A2B48]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A2B48] placeholder-[#536176] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      />
    </div>
  );
}

function PaymentPurposeFilterSelect({
  selectedPurpose,
  onPurposeChange,
}: {
  selectedPurpose?: PaymentPurpose | "";
  onPurposeChange?: (purpose: PaymentPurpose | "") => void;
}) {
  const { filters, purposes } = translations.payments;

  return (
    <div className="flex items-center">
      <label htmlFor="payments-purpose-filter" className="sr-only">
        {filters.purpose.label}
      </label>
      <select
        id="payments-purpose-filter"
        aria-label={filters.purpose.label}
        value={selectedPurpose ?? ""}
        onChange={(e) => onPurposeChange?.(e.target.value as PaymentPurpose | "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.purpose.all}</option>
        {PURPOSE_OPTIONS.map((purpose) => (
          <option key={purpose} value={purpose}>
            {purposes[purpose]}
          </option>
        ))}
      </select>
    </div>
  );
}

function PaymentStatusFilterSelect({
  selectedStatus,
  onStatusChange,
}: {
  selectedStatus?: PaymentStatus | "";
  onStatusChange?: (status: PaymentStatus | "") => void;
}) {
  const { filters, statuses } = translations.payments;

  return (
    <div className="flex items-center">
      <label htmlFor="payments-status-filter" className="sr-only">
        {filters.status.label}
      </label>
      <select
        id="payments-status-filter"
        aria-label={filters.status.label}
        value={selectedStatus ?? ""}
        onChange={(e) => onStatusChange?.(e.target.value as PaymentStatus | "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.status.all}</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {statuses[status]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PaymentsFilters({
  searchQuery = "",
  onSearchChange,
  selectedPurpose = "",
  onPurposeChange,
  selectedStatus = "",
  onStatusChange,
  className = "",
}: PaymentsFiltersProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 ${className}`.trim()}
      data-testid="payments-filters"
    >
      <PaymentSearchInput
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <PaymentPurposeFilterSelect
        selectedPurpose={selectedPurpose}
        onPurposeChange={onPurposeChange}
      />
      <PaymentStatusFilterSelect
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
