import type { BottleneckType } from "@/domain/operations/operation-summary";
import { translations } from "@/infrastructure/i18n/translations";

const BOTTLENECK_OPTIONS: readonly BottleneckType[] = [
  "stalled",
  "pending_proposal_24h",
  "pending_booking_deposit",
  "scheduled_today",
  "delayed_service",
  "pending_final_payment",
  "none",
];

export interface CategoryOption {
  readonly id: number;
  readonly name: string;
}

export interface OperationsFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
  categoryOptions?: readonly CategoryOption[];
  selectedBottleneck?: BottleneckType | "";
  onBottleneckChange?: (bottleneck: BottleneckType | "") => void;
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

function ParticipantSearchInput({
  searchQuery,
  onSearchChange,
}: {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}) {
  const { filters } = translations.operations;

  return (
    <div className="relative w-full max-w-xs">
      <label htmlFor="operations-search" className="sr-only">
        {filters.search.label}
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon />
      </div>
      <input
        id="operations-search"
        type="search"
        aria-label={filters.search.label}
        value={searchQuery ?? ""}
        onChange={(e) => onSearchChange?.(e.target.value)}
        placeholder={filters.search.placeholder}
        className="w-full rounded-xl border border-[#1A2B48]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A2B48] placeholder-[#536176] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      />
    </div>
  );
}

function CategoryFilterSelect({
  selectedCategoryId,
  onCategoryChange,
  categoryOptions = [],
}: {
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
  categoryOptions?: readonly CategoryOption[];
}) {
  const { filters } = translations.operations;

  return (
    <div className="flex items-center">
      <label htmlFor="operations-category-filter" className="sr-only">
        {filters.category.label}
      </label>
      <select
        id="operations-category-filter"
        aria-label={filters.category.label}
        value={selectedCategoryId ?? ""}
        onChange={(e) => onCategoryChange?.(e.target.value ? Number(e.target.value) : "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.category.all}</option>
        {categoryOptions.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function BottleneckFilterSelect({
  selectedBottleneck,
  onBottleneckChange,
}: {
  selectedBottleneck?: BottleneckType | "";
  onBottleneckChange?: (bottleneck: BottleneckType | "") => void;
}) {
  const { filters, bottleneck: bottleneckTrans } = translations.operations;

  return (
    <div className="flex items-center">
      <label htmlFor="operations-bottleneck-filter" className="sr-only">
        {filters.bottleneck.label}
      </label>
      <select
        id="operations-bottleneck-filter"
        aria-label={filters.bottleneck.label}
        value={selectedBottleneck ?? ""}
        onChange={(e) => onBottleneckChange?.(e.target.value as BottleneckType | "")}
        className="rounded-xl border border-[#1A2B48]/15 bg-white px-3 py-2.5 text-sm text-[#1A2B48] transition-colors focus:border-[#147560] focus:outline-hidden focus:ring-1 focus:ring-[#147560]"
      >
        <option value="">{filters.bottleneck.all}</option>
        {BOTTLENECK_OPTIONS.map((key) => (
          <option key={key} value={key}>
            {bottleneckTrans[key]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function OperationsFilterBar({
  searchQuery = "",
  onSearchChange,
  selectedCategoryId = "",
  onCategoryChange,
  categoryOptions = [],
  selectedBottleneck = "",
  onBottleneckChange,
}: OperationsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4" data-testid="operations-filter-bar">
      <ParticipantSearchInput
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <CategoryFilterSelect
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
        categoryOptions={categoryOptions}
      />
      <BottleneckFilterSelect
        selectedBottleneck={selectedBottleneck}
        onBottleneckChange={onBottleneckChange}
      />
    </div>
  );
}
