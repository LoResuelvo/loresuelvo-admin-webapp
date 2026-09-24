"use client";

import { useMemo, useState } from "react";
import type { ConsumerHistoryItem } from "@/domain/users/consumer-history";
import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerHistoryFilters } from "./consumer-history-filters";
import { ConsumerHistoryTable } from "./consumer-history-table";

export interface ConsumerHistoryListProps {
  history: ConsumerHistoryItem[];
  selectedType?: string;
  selectedStatus?: string;
  onTypeChange?: (type: string) => void;
  onStatusChange?: (status: string) => void;
}

function ConsumerHistoryEmpty() {
  const copy = translations.users.consumerDetail.history;

  return (
    <div
      role="status"
      className="p-12 text-center text-[#536176]"
    >
      <p className="text-base font-medium">{copy.empty}</p>
    </div>
  );
}

function ConsumerHistoryFilteredEmpty() {
  const copy = translations.users.consumerDetail.history;

  return (
    <div
      role="status"
      className="p-12 text-center text-[#536176]"
    >
      <p className="text-base font-medium">{copy.filters.emptyFiltered}</p>
    </div>
  );
}

function filterHistory(
  items: ConsumerHistoryItem[],
  type?: string,
  status?: string,
): ConsumerHistoryItem[] {
  return items.filter((item) => {
    if (type && type !== "all" && item.resourceType !== type) {
      return false;
    }
    if (status && status !== "all" && item.status !== status) {
      return false;
    }
    return true;
  });
}

function useHistoryFilters(
  externalType?: string,
  externalStatus?: string,
  onExternalTypeChange?: (type: string) => void,
  onExternalStatusChange?: (status: string) => void,
) {
  const [internalType, setInternalType] = useState<string>("all");
  const [internalStatus, setInternalStatus] = useState<string>("all");

  const selectedType = externalType ?? internalType;
  const selectedStatus = externalStatus ?? internalStatus;

  const handleTypeChange = (type: string) => {
    setInternalType(type);
    onExternalTypeChange?.(type);
  };

  const handleStatusChange = (status: string) => {
    setInternalStatus(status);
    onExternalStatusChange?.(status);
  };

  return { selectedType, selectedStatus, handleTypeChange, handleStatusChange };
}

export function ConsumerHistoryList({
  history,
  selectedType: externalType,
  selectedStatus: externalStatus,
  onTypeChange: onExternalTypeChange,
  onStatusChange: onExternalStatusChange,
}: ConsumerHistoryListProps) {
  const copy = translations.users.consumerDetail.history;
  const { selectedType, selectedStatus, handleTypeChange, handleStatusChange } =
    useHistoryFilters(
      externalType,
      externalStatus,
      onExternalTypeChange,
      onExternalStatusChange,
    );

  const filteredHistory = useMemo(
    () => filterHistory(history, selectedType, selectedStatus),
    [history, selectedType, selectedStatus],
  );

  return (
    <section
      data-testid="consumer-history-list"
      aria-label={copy.title}
      className="rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs overflow-hidden"
    >
      <header className="flex flex-col gap-4 border-b border-[#1A2B48]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A2B48]">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-[#536176]">{copy.subtitle}</p>
        </div>
        {history.length > 0 && (
          <ConsumerHistoryFilters
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
          />
        )}
      </header>

      {history.length === 0 ? (
        <ConsumerHistoryEmpty />
      ) : filteredHistory.length === 0 ? (
        <ConsumerHistoryFilteredEmpty />
      ) : (
        <ConsumerHistoryTable history={filteredHistory} />
      )}
    </section>
  );
}
