import { translations } from "@/infrastructure/i18n/translations";

export function AuditedChatLoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="audited-chat-loading"
      className="space-y-4 py-6"
    >
      <div className="flex items-center justify-center gap-3 text-sm text-[#536176]">
        <svg
          className="size-5 animate-spin text-[#147560]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="font-medium">{translations.operations.chat.loading}</span>
      </div>
      <div className="space-y-3 px-2">
        <div className="h-16 w-3/4 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-16 w-3/4 ml-auto rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-12 w-2/3 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
