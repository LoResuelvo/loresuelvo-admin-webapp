import Link from "next/link";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

export interface OperationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OperationDetailPage({ params }: OperationDetailPageProps) {
  const { id } = await params;
  const copy = translations.operations.detail;

  return (
    <section aria-label={copy.title} className="max-w-4xl space-y-6">
      <div>
        <Link
          href={ROUTES.operations}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#147560] hover:text-[#105F4E] transition-colors"
        >
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {copy.backToList}
        </Link>
      </div>

      <div className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs">
        <header className="border-b border-[#1A2B48]/10 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-[#536176]">
            {copy.subtitle}
          </p>
        </header>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-[#F4F1EE]/50 p-4">
            <span className="text-sm font-medium text-[#536176]">ID de contratación</span>
            <span className="font-mono text-sm font-semibold text-[#1A2B48]">{id}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
