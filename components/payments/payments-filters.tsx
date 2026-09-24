import { translations } from "@/infrastructure/i18n/translations";

export interface PaymentsFiltersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
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

export function PaymentsFilters({
  searchQuery = "",
  onSearchChange,
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
    </div>
  );
}
