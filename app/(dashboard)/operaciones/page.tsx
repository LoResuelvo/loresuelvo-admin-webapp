import { translations } from "@/infrastructure/i18n/translations";
import { OperationsInboxClient } from "@/components/operations/operations-inbox-client";

interface OperationsPageProps {
  searchParams: Promise<{ provider_id?: string | string[] }>;
}

function parseProviderId(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const providerId = Number(value);
  return Number.isSafeInteger(providerId) && providerId > 0 && providerId <= 2_147_483_647
    ? providerId
    : undefined;
}

export default async function OperationsPage({ searchParams }: OperationsPageProps) {
  const providerId = parseProviderId((await searchParams).provider_id);
  const copy = translations.operations;

  return (
    <section aria-label={copy.title} className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-[#536176]">
          {copy.subtitle}
        </p>
      </div>

      <OperationsInboxClient initialFilters={providerId ? { providerId } : undefined} />
    </section>
  );
}
