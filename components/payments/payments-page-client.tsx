"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PaymentFilters, PaymentIntentSummary, PaymentPurpose, PaymentStatus } from "./types";
import { PaymentsView } from "./payments-view";
import type { PaymentSearchField } from "./payments-filters";
import { getPaymentsAction } from "@/app/(dashboard)/pagos/actions";
import { translations } from "@/infrastructure/i18n/translations";

const PAGE_SIZE = 20;
const PAYMENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

interface PaymentsState {
  items: PaymentIntentSummary[];
  page: { limit: number; nextCursor: string | null };
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isForbidden: boolean;
}

interface AppliedSearch {
  field: PaymentSearchField;
  value: string;
}

const initialState: PaymentsState = {
  items: [],
  page: { limit: PAGE_SIZE, nextCursor: null },
  isLoading: true,
  isLoadingMore: false,
  error: null,
  isForbidden: false,
};

function buildPaymentFilters(
  purpose: PaymentPurpose | "",
  status: PaymentStatus | "",
  search: AppliedSearch | null,
): PaymentFilters {
  const filters: PaymentFilters = { limit: PAGE_SIZE };
  if (purpose) filters.purpose = purpose;
  if (status) filters.intentStatus = status;
  if (!search) return filters;

  switch (search.field) {
    case "paymentIntentId":
      filters.paymentIntentId = search.value;
      break;
    case "externalReference":
      filters.externalReference = search.value;
      break;
    case "externalPaymentId":
      filters.externalPaymentId = search.value;
      break;
    case "serviceProposalId":
      filters.serviceProposalId = Number(search.value);
      break;
    case "consumerEmail":
      filters.consumerEmail = search.value;
      break;
    case "providerEmail":
      filters.providerEmail = search.value;
      break;
  }

  return filters;
}

function normalizeSearch(field: PaymentSearchField, value: string): { value: string; error: string | null } {
  const normalized = value.trim();
  if (!normalized) return { value: "", error: null };

  if (field === "paymentIntentId" || field === "externalReference") {
    const lowerCaseId = normalized.toLowerCase();
    if (!PAYMENT_ID_PATTERN.test(lowerCaseId)) {
      return { value: normalized, error: translations.payments.filters.search.invalidPaymentId };
    }
    return { value: lowerCaseId, error: null };
  }

  if (field === "serviceProposalId") {
    if (!/^[1-9]\d*$/.test(normalized)) {
      return { value: normalized, error: translations.payments.filters.search.invalidProposalId };
    }
    return { value: normalized, error: null };
  }

  return { value: normalized, error: null };
}

export function PaymentsPageClient() {
  const [state, setState] = useState<PaymentsState>(initialState);
  const [purpose, setPurpose] = useState<PaymentPurpose | "">("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [searchField, setSearchField] = useState<PaymentSearchField>("paymentIntentId");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [appliedSearch, setAppliedSearch] = useState<AppliedSearch | null>(null);
  const requestId = useRef(0);

  const filters = useMemo(
    () => buildPaymentFilters(purpose, status, appliedSearch),
    [purpose, status, appliedSearch],
  );

  const load = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setState((previous) => ({
      ...previous,
      items: [],
      page: { limit: PAGE_SIZE, nextCursor: null },
      isLoading: true,
      isLoadingMore: false,
      error: null,
      isForbidden: false,
    }));

    try {
      const result = await getPaymentsAction(filters);
      if (currentRequestId !== requestId.current) return;
      if (result.success) {
        setState({
          items: result.data.items,
          page: result.data.page,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          isForbidden: false,
        });
      } else {
        setState((previous) => ({
          ...previous,
          isLoading: false,
          isLoadingMore: false,
          error: result.error,
          isForbidden: result.isForbidden ?? false,
        }));
      }
    } catch {
      if (currentRequestId !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        isLoading: false,
        isLoadingMore: false,
        error: translations.payments.error,
        isForbidden: false,
      }));
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    const cursor = state.page.nextCursor;
    if (!cursor || state.isLoading || state.isLoadingMore) return;

    const currentRequestId = requestId.current;
    setState((previous) => ({ ...previous, isLoadingMore: true, error: null }));
    try {
      const result = await getPaymentsAction({ ...filters, cursor });
      if (currentRequestId !== requestId.current) return;
      if (result.success) {
        setState((previous) => {
          const existingIds = new Set(previous.items.map((item) => item.id));
          const nextItems = result.data.items.filter((item) => !existingIds.has(item.id));
          return {
            ...previous,
            items: [...previous.items, ...nextItems],
            page: result.data.page,
            isLoadingMore: false,
            error: null,
            isForbidden: false,
          };
        });
      } else {
        setState((previous) => ({
          ...previous,
          isLoadingMore: false,
          error: result.error,
          isForbidden: result.isForbidden ?? false,
        }));
      }
    } catch {
      if (currentRequestId !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        isLoadingMore: false,
        error: translations.payments.error,
        isForbidden: false,
      }));
    }
  }, [filters, state.isLoading, state.isLoadingMore, state.page.nextCursor]);

  const applySearch = useCallback(() => {
    const normalized = normalizeSearch(searchField, searchQuery);
    setSearchError(normalized.error);
    if (normalized.error) return;
    setAppliedSearch(normalized.value ? { field: searchField, value: normalized.value } : null);
  }, [searchField, searchQuery]);

  return (
    <PaymentsView
      items={state.items}
      isLoading={state.isLoading}
      isLoadingMore={state.isLoadingMore}
      hasNextPage={Boolean(state.page.nextCursor)}
      error={state.error}
      isForbidden={state.isForbidden}
      searchField={searchField}
      onSearchFieldChange={(field) => {
        setSearchField(field);
        setSearchError(null);
      }}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchSubmit={applySearch}
      searchError={searchError}
      selectedPurpose={purpose}
      onPurposeChange={setPurpose}
      selectedStatus={status}
      onStatusChange={setStatus}
      onRetry={load}
      onLoadMore={loadMore}
    />
  );
}
