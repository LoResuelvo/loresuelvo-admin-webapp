import { useMemo } from "react";
import type { Provider, VerificationStatus } from "@/domain/users/provider";
import { translations } from "@/infrastructure/i18n/translations";
import { ProvidersFilterBar } from "./providers-filter-bar";
import { ProvidersTable } from "./providers-table";

export interface ProvidersViewProps {
  providers?: Provider[];
  isLoading?: boolean;
  error?: string | null;
  isForbidden?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categories?: string[];
  selectedStatus?: VerificationStatus | "";
  onStatusChange?: (status: VerificationStatus | "") => void;
  onRetry?: () => void;
}

function ProvidersLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="mb-4 block size-8 rounded-full border-2 border-[#147560]/20 border-t-[#147560] motion-safe:animate-spin"
      />
      <p className="text-sm font-medium text-[#1A2B48]/70">
        {translations.users.providers.loading}
      </p>
    </div>
  );
}

function ProvidersForbidden() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800"
    >
      <p className="font-medium">{translations.users.providers.forbidden}</p>
    </div>
  );
}

function ProvidersError({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
    >
      <p className="font-medium">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {translations.users.retry}
        </button>
      )}
    </div>
  );
}

function ProvidersEmpty() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs"
    >
      <p className="text-base font-medium text-[#1A2B48]/80">
        {translations.users.providers.empty}
      </p>
    </div>
  );
}

export function ProvidersView({
  providers = [],
  isLoading = false,
  error = null,
  isForbidden = false,
  searchQuery = "",
  onSearchChange,
  selectedCategory = "",
  onCategoryChange,
  categories,
  selectedStatus = "",
  onStatusChange,
  onRetry,
}: ProvidersViewProps) {
  const categoryOptions = useMemo(() => {
    const set = new Set(categories ?? []);
    for (const p of providers) {
      if (p.category?.name) {
        set.add(p.category.name);
      }
    }
    return Array.from(set).sort();
  }, [categories, providers]);

  return (
    <div
      id="panel-providers"
      role="tabpanel"
      aria-labelledby="tab-providers"
      className="space-y-6"
    >
      <ProvidersFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        categoryOptions={categoryOptions}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
      />

      {isLoading && <ProvidersLoading />}
      {!isLoading && isForbidden && <ProvidersForbidden />}
      {!isLoading && !isForbidden && error && (
        <ProvidersError error={error} onRetry={onRetry} />
      )}
      {!isLoading && !isForbidden && !error && providers.length === 0 && (
        <ProvidersEmpty />
      )}
      {!isLoading && !isForbidden && !error && providers.length > 0 && (
        <ProvidersTable providers={providers} />
      )}
    </div>
  );
}
