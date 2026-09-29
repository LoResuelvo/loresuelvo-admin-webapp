import { translations } from "@/infrastructure/i18n/translations";
import { AuditConsolePage } from "@/components/audit/audit-console-page";

export default function AuditPage() {
  const copy = translations.audit;

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

      <AuditConsolePage />
    </section>
  );
}
