import type { FormEvent } from "react";
import type { PaymentPurpose, PaymentStatus } from "./types";
import { translations } from "@/infrastructure/i18n/translations";

export type PaymentSearchField =
  | "paymentIntentId"
  | "externalReference"
  | "externalPaymentId"
  | "serviceProposalId"
  | "consumerEmail"
  | "providerEmail";

const SEARCH_FIELDS: readonly PaymentSearchField[] = [
  "paymentIntentId",
  "externalReference",
  "externalPaymentId",
  "serviceProposalId",
  "consumerEmail",
  "providerEmail",
];
const PURPOSE_OPTIONS: readonly PaymentPurpose[] = ["booking_deposit", "service_balance"];
const STATUS_OPTIONS: readonly PaymentStatus[] = [
  "requires_checkout",
  "checkout_ready",
  "processing",
  "paid",
  "rejected",
  "expired",
  "cancelled",
  "refunded",
  "disputed",
  "payment_mismatch",
];

export interface PaymentsFiltersProps {
  searchField: PaymentSearchField;
  onSearchFieldChange: (field: PaymentSearchField) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  searchError?: string | null;
  selectedPurpose: PaymentPurpose | "";
  onPurposeChange: (purpose: PaymentPurpose | "") => void;
  selectedStatus: PaymentStatus | "";
  onStatusChange: (status: PaymentStatus | "") => void;
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

function PaymentSearchForm({
  searchField,
  onSearchFieldChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchError,
}: Pick<
  PaymentsFiltersProps,
  | "searchField"
  | "onSearchFieldChange"
  | "searchQuery"
  | "onSearchChange"
  | "onSearchSubmit"
  | "searchError"
>) {
  const { search } = translations.payments.filters;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="payments-search-field" className="sr-only">
          {search.fieldLabel}
        </label>
        <select
          id="payments-search-field"
          aria-label={search.fieldLabel}
          value={searchField}
          onChange={(event) => onSearchFieldChange(event.target.value as PaymentSearchField)}
          className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        >
          {SEARCH_FIELDS.map((field) => (
            <option key={field} value={field}>{search.fields[field]}</option>
          ))}
        </select>
      </div>
      <div className="relative w-full max-w-sm">
        <label htmlFor="payments-search" className="sr-only">
          {search.label}
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon />
        </div>
        <input
          id="payments-search"
          type="search"
          role="searchbox"
          aria-label={search.label}
          aria-invalid={Boolean(searchError)}
          aria-describedby={searchError ? "payments-search-error" : undefined}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={search.placeholder}
          className="w-full rounded-xl border border-[#1A2B48]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A2B48] placeholder-[#536176] focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-[#147560] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#105c4b] focus:outline-hidden focus:ring-2 focus:ring-[#147560] focus:ring-offset-2"
      >
        {search.submit}
      </button>
      {searchError && (
        <p id="payments-search-error" role="alert" className="w-full text-sm text-red-700">
          {searchError}
        </p>
      )}
    </form>
  );
}

function PaymentPurposeFilterSelect({
  selectedPurpose,
  onPurposeChange,
}: Pick<PaymentsFiltersProps, "selectedPurpose" | "onPurposeChange">) {
  const { filters, purposes } = translations.payments;

  return (
    <div className="flex items-center">
      <label htmlFor="payments-purpose-filter" className="sr-only">{filters.purpose.label}</label>
      <select
        id="payments-purpose-filter"
        aria-label={filters.purpose.label}
        value={selectedPurpose}
        onChange={(event) => onPurposeChange(event.target.value as PaymentPurpose | "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.purpose.all}</option>
        {PURPOSE_OPTIONS.map((purpose) => (
          <option key={purpose} value={purpose}>{purposes[purpose]}</option>
        ))}
      </select>
    </div>
  );
}

function PaymentStatusFilterSelect({
  selectedStatus,
  onStatusChange,
}: Pick<PaymentsFiltersProps, "selectedStatus" | "onStatusChange">) {
  const { filters, statuses } = translations.payments;

  return (
    <div className="flex items-center">
      <label htmlFor="payments-status-filter" className="sr-only">{filters.status.label}</label>
      <select
        id="payments-status-filter"
        aria-label={filters.status.label}
        value={selectedStatus}
        onChange={(event) => onStatusChange(event.target.value as PaymentStatus | "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.status.all}</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>{statuses[status]}</option>
        ))}
      </select>
    </div>
  );
}

export function PaymentsFilters({
  className = "",
  ...props
}: PaymentsFiltersProps) {
  return (
    <div className={`flex flex-wrap items-end gap-4 ${className}`.trim()} data-testid="payments-filters">
      <PaymentSearchForm
        searchField={props.searchField}
        onSearchFieldChange={props.onSearchFieldChange}
        searchQuery={props.searchQuery}
        onSearchChange={props.onSearchChange}
        onSearchSubmit={props.onSearchSubmit}
        searchError={props.searchError}
      />
      <PaymentPurposeFilterSelect
        selectedPurpose={props.selectedPurpose}
        onPurposeChange={props.onPurposeChange}
      />
      <PaymentStatusFilterSelect
        selectedStatus={props.selectedStatus}
        onStatusChange={props.onStatusChange}
      />
    </div>
  );
}
