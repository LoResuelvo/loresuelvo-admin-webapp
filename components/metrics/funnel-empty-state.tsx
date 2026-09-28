import { translations } from "@/infrastructure/i18n/translations";

export interface FunnelEmptyStateProps {
  message?: string;
  className?: string;
}

export function FunnelEmptyState({
  message = translations.metrics.empty,
  className = "",
}: FunnelEmptyStateProps) {
  return (
    <div
      role="status"
      data-testid="funnel-empty-state"
      className={`rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs ${className}`.trim()}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#147560]/10 text-[#147560] mb-4">
        <svg
          aria-hidden="true"
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      </div>
      <p className="text-base font-semibold text-[#1A2B48]">{message}</p>
      <p className="mt-1 text-sm text-[#536176]">
        Ajuste el rango de fechas o los filtros para visualizar la actividad del embudo.
      </p>
    </div>
  );
}
