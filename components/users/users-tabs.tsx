import { translations } from "@/infrastructure/i18n/translations";

export type UsersTab = "consumers" | "providers";

export interface UsersTabsProps {
  activeTab: UsersTab;
  onTabChange?: (tab: UsersTab) => void;
  className?: string;
}

export function UsersTabs({ activeTab, onTabChange, className = "" }: UsersTabsProps) {
  const copy = translations.users.tabs;

  return (
    <div
      role="tablist"
      aria-label={translations.users.title}
      className={`flex border-b border-[#1A2B48]/10 gap-6 ${className}`.trim()}
    >
      <button
        type="button"
        role="tab"
        id="tab-consumers"
        aria-selected={activeTab === "consumers"}
        aria-controls="panel-consumers"
        tabIndex={activeTab === "consumers" ? 0 : -1}
        onClick={() => onTabChange?.("consumers")}
        className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560] ${
          activeTab === "consumers"
            ? "border-[#147560] text-[#147560]"
            : "border-transparent text-[#536176] hover:text-[#1A2B48] hover:border-[#1A2B48]/20"
        }`}
      >
        {copy.consumers}
      </button>
      <button
        type="button"
        role="tab"
        id="tab-providers"
        aria-selected={activeTab === "providers"}
        aria-controls="panel-providers"
        tabIndex={activeTab === "providers" ? 0 : -1}
        onClick={() => onTabChange?.("providers")}
        className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560] ${
          activeTab === "providers"
            ? "border-[#147560] text-[#147560]"
            : "border-transparent text-[#536176] hover:text-[#1A2B48] hover:border-[#1A2B48]/20"
        }`}
      >
        {copy.providers}
      </button>
    </div>
  );
}
