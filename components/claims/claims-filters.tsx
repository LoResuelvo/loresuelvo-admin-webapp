import type { ClaimStatus } from "@/domain/claims/claim";
import { translations } from "@/infrastructure/i18n/translations";

export interface ClaimsFiltersState {
  status: ClaimStatus | "";
  q: string;
}

export interface ClaimsFiltersProps {
  filters: ClaimsFiltersState;
  onChange: (filters: ClaimsFiltersState) => void;
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

function StatusFilterSelect({
  value,
  onChange,
}: {
  value: ClaimStatus | "";
  onChange: (status: ClaimStatus | "") => void;
}) {
  const copy = translations.claims;
  return (
    <div className="flex flex-col gap-1.5 sm:w-56">
      <label htmlFor="claims-status-filter" className="sr-only">
        {copy.filters.statusLabel}
      </label>
      <select
        id="claims-status-filter"
        aria-label={copy.filters.statusLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as ClaimStatus | "")}
        className="h-10 rounded-xl border border-[#1A2B48]/10 bg-white px-3.5 text-sm text-[#1A2B48] focus:border-[#147560] focus:outline-none focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{copy.filters.statusAll}</option>
        <option value="open">{copy.status.open}</option>
        <option value="in_review">{copy.status.in_review}</option>
        <option value="resolved">{copy.status.resolved}</option>
        <option value="dismissed">{copy.status.dismissed}</option>
      </select>
    </div>
  );
}

function ParticipantSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (query: string) => void;
}) {
  const copy = translations.claims;
  return (
    <div className="relative flex-1 max-w-sm">
      <label htmlFor="claims-search-input" className="sr-only">
        {copy.filters.searchLabel}
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <SearchIcon />
      </div>
      <input
        id="claims-search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={copy.filters.searchPlaceholder}
        aria-label={copy.filters.searchLabel}
        className="h-10 w-full rounded-xl border border-[#1A2B48]/10 bg-white pl-10 pr-4 text-sm text-[#1A2B48] placeholder-[#536176] focus:border-[#147560] focus:outline-none focus:ring-1 focus:ring-[#147560]"
      />
    </div>
  );
}

export function ClaimsFilters({ filters, onChange, className = "" }: ClaimsFiltersProps) {
  const hasActiveFilters = filters.status !== "" || filters.q !== "";

  const handleStatusChange = (status: ClaimStatus | "") => {
    onChange({ ...filters, status });
  };

  const handleQueryChange = (q: string) => {
    onChange({ ...filters, q });
  };

  const handleClear = () => {
    onChange({ status: "", q: "" });
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      <ParticipantSearchField value={filters.q} onChange={handleQueryChange} />
      <StatusFilterSelect value={filters.status} onChange={handleStatusChange} />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-medium text-[#147560] hover:text-[#105F4E] hover:underline"
        >
          {translations.claims.filters.clear}
        </button>
      )}
    </div>
  );
}
