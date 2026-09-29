import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { translations } from "@/infrastructure/i18n/translations";

export interface OperationLinkCardProps {
  operationId: number;
  className?: string;
}

function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

export function OperationLinkCard({
  operationId,
  className = "",
}: OperationLinkCardProps) {
  const copy = translations.claims.detail;
  const href = ROUTES.operationDetail(operationId);

  return (
    <section
      aria-label={copy.operationTitle}
      className={`rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs ${className}`.trim()}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#147560]/10 text-[#147560]">
              <LinkIcon />
            </span>
            <h2 className="text-base font-semibold text-[#1A2B48]">
              {copy.operationTitle}
            </h2>
          </div>
          <p className="text-sm text-[#536176]">{copy.operationDescription}</p>
        </div>

        <Link
          href={href}
          data-testid="operation-link"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147560] px-4 py-2.5 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          <span>{copy.operationBadge}{operationId}</span>
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}

