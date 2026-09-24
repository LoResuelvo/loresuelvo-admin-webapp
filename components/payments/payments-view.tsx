"use client";

import { useMemo, useState } from "react";
import type { PaymentIntentSummary, PaymentPurpose, PaymentStatus } from "./types";
import { translations } from "@/infrastructure/i18n/translations";
import { PaymentsTable } from "./payments-table";
import { PaymentsSkeleton } from "./payments-skeleton";
import { PaymentsFilters } from "./payments-filters";
import { filterPayments } from "./filter-payments";

export interface PaymentsViewProps {
  items: PaymentIntentSummary[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedPurpose?: PaymentPurpose | "";
  onPurposeChange?: (purpose: PaymentPurpose | "") => void;
  selectedStatus?: PaymentStatus | "";
  onStatusChange?: (status: PaymentStatus | "") => void;
  className?: string;
}

function PaymentsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">{title}</h1>
      <p className="mt-1 text-sm text-[#536176]">{subtitle}</p>
    </div>
  );
}

function PaymentsErrorAlert({
  error,
  retryLabel,
  onRetry,
}: {
  error: string;
  retryLabel: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 space-y-3"
    >
      <p className="text-sm">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

function PaymentsEmptyState({ message }: { message: string }) {
  return (
    <div
      data-testid="payments-empty"
      className="rounded-xl border border-[#1A2B48]/10 bg-white p-8 text-center text-[#536176]"
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}

interface UsePaymentFiltersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedPurpose?: PaymentPurpose | "";
  onPurposeChange?: (purpose: PaymentPurpose | "") => void;
  selectedStatus?: PaymentStatus | "";
  onStatusChange?: (status: PaymentStatus | "") => void;
}

function usePaymentFilters(props: UsePaymentFiltersProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [localPurpose, setLocalPurpose] = useState<PaymentPurpose | "">("");
  const [localStatus, setLocalStatus] = useState<PaymentStatus | "">("");

  return {
    searchQuery: props.searchQuery ?? localSearch,
    onSearchChange: props.onSearchChange ?? setLocalSearch,
    selectedPurpose: props.selectedPurpose ?? localPurpose,
    onPurposeChange: props.onPurposeChange ?? setLocalPurpose,
    selectedStatus: props.selectedStatus ?? localStatus,
    onStatusChange: props.onStatusChange ?? setLocalStatus,
  };
}

export function PaymentsView({
  items,
  isLoading = false,
  error = null,
  onRetry,
  className = "",
  ...filterProps
}: PaymentsViewProps) {
  const filters = usePaymentFilters(filterProps);
  const copy = translations.payments;

  const filteredItems = useMemo(
    () =>
      filterPayments(items, {
        query: filters.searchQuery,
        purpose: filters.selectedPurpose || undefined,
        status: filters.selectedStatus || undefined,
      }),
    [items, filters.searchQuery, filters.selectedPurpose, filters.selectedStatus],
  );

  if (isLoading) {
    return <PaymentsSkeleton className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <PaymentsHeader title={copy.title} subtitle={copy.subtitle} />

      {error ? (
        <PaymentsErrorAlert error={error} retryLabel={copy.retry} onRetry={onRetry} />
      ) : (
        <>
          <PaymentsFilters {...filters} />
          {filteredItems.length === 0 ? (
            <PaymentsEmptyState message={copy.empty} />
          ) : (
            <PaymentsTable items={filteredItems} />
          )}
        </>
      )}
    </div>
  );
}
