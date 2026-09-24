import Link from "next/link";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { ConsumerHistoryClient } from "@/components/users/consumer-history-client";

export interface ConsumerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsumerDetailPage({
  params,
}: ConsumerDetailPageProps) {
  const { id } = await params;
  const copy = translations.users.consumerDetail;

  return (
    <section aria-label={copy.title} className="max-w-6xl space-y-6">
      <div>
        <Link
          href={ROUTES.users}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          {copy.backToList}
        </Link>
      </div>

      <header className="border-b border-[#1A2B48]/10 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
          {copy.title}
        </h1>
      </header>

      <ConsumerHistoryClient id={id} />
    </section>
  );
}
