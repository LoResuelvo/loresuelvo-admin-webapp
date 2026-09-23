import { translations } from "@/infrastructure/i18n/translations";

export interface OperationsEmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
}

function EmptyInboxIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mx-auto size-12 text-[#1A2B48]/30"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V3.75"
      />
    </svg>
  );
}

export function OperationsEmptyState({
  title = translations.operations.empty.title,
  message = translations.operations.empty.message,
  className = "",
}: OperationsEmptyStateProps) {
  return (
    <div
      role="status"
      data-testid="operations-empty-state"
      className={`rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs ${className}`.trim()}
    >
      <EmptyInboxIcon />
      <h3 className="mt-4 text-base font-semibold text-[#1A2B48]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[#536176]">
        {message}
      </p>
    </div>
  );
}
