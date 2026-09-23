import type { VerificationStatus } from "@/domain/users/provider";
import { translations } from "@/infrastructure/i18n/translations";

export interface ProvidersFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions: string[];
  selectedStatus?: VerificationStatus | "";
  onStatusChange?: (status: VerificationStatus | "") => void;
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

function CategoryFilterSelect({
  selectedCategory,
  onCategoryChange,
  categoryOptions,
}: {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions: string[];
}) {
  const { filters } = translations.users.providers;
  return (
    <div className="flex items-center">
      <label htmlFor="provider-category-filter" className="sr-only">
        {filters.category.label}
      </label>
      <select
        id="provider-category-filter"
        aria-label={filters.category.label}
        value={selectedCategory}
        onChange={(e) => onCategoryChange?.(e.target.value)}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.category.all}</option>
        {categoryOptions.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusFilterSelect({
  selectedStatus,
  onStatusChange,
}: {
  selectedStatus?: VerificationStatus | "";
  onStatusChange?: (status: VerificationStatus | "") => void;
}) {
  const { filters, status: statusTrans } = translations.users.providers;
  return (
    <div className="flex items-center">
      <label htmlFor="provider-status-filter" className="sr-only">
        {filters.status.label}
      </label>
      <select
        id="provider-status-filter"
        aria-label={filters.status.label}
        value={selectedStatus}
        onChange={(e) => onStatusChange?.(e.target.value as VerificationStatus | "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.status.all}</option>
        <option value="approved">{statusTrans.approved}</option>
        <option value="in_review">{statusTrans.in_review}</option>
        <option value="declined">{statusTrans.declined}</option>
        <option value="unverified">{statusTrans.unverified}</option>
      </select>
    </div>
  );
}

export function ProvidersFilterBar({
  searchQuery = "",
  onSearchChange,
  selectedCategory = "",
  onCategoryChange,
  categoryOptions,
  selectedStatus = "",
  onStatusChange,
}: ProvidersFilterBarProps) {
  const { search } = translations.users.providers;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative w-full max-w-md">
        <label htmlFor="provider-search" className="sr-only">
          {search.label}
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon />
        </div>
        <input
          id="provider-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={search.placeholder}
          className="w-full rounded-xl border border-[#1A2B48]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A2B48] placeholder-[#536176] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
        />
      </div>

      <CategoryFilterSelect
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        categoryOptions={categoryOptions}
      />

      <StatusFilterSelect
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
