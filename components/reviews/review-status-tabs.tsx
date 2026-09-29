"use client";

import type { ReviewStatus } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";

export interface ReviewStatusTabsProps {
  currentStatus?: ReviewStatus;
  onStatusChange: (status?: ReviewStatus) => void;
  className?: string;
}

type TabOption = {
  value: ReviewStatus | undefined;
  label: string;
};

export function ReviewStatusTabs({
  currentStatus,
  onStatusChange,
  className = "",
}: ReviewStatusTabsProps) {
  const copy = translations.moderation.filters;

  const tabs: TabOption[] = [
    { value: undefined, label: copy.all },
    { value: "reported", label: copy.reported },
    { value: "hidden", label: copy.hidden },
    { value: "visible", label: copy.visible },
  ];

  return (
    <nav
      role="tablist"
      aria-label={copy.title}
      className={`inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#1A2B48]/10 bg-white p-1.5 shadow-xs ${className}`.trim()}
    >
      {tabs.map((tab) => {
        const isSelected = currentStatus === tab.value;
        return (
          <button
            key={tab.value ?? "all"}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onStatusChange(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560] ${
              isSelected
                ? "bg-[#147560] font-semibold text-white shadow-xs"
                : "font-medium text-[#536176] hover:bg-[#F4F1EE] hover:text-[#1A2B48]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
