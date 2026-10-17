import type { DiagnosticCheck } from "@/domain/users/provider-diagnostic";
import { translations } from "@/infrastructure/i18n/translations";

export function ProviderDiagnosticChecks({ checks }: { checks: DiagnosticCheck[] }) {
  const copy = translations.users.diagnostic.checks;
  if (!checks.length) return null;
  const controls: Record<string, string> = copy.controls;
  const reasons: Record<string, string> = copy.reasons;
  return (
    <section aria-label={copy.title} className="rounded-xl border border-[#1A2B48]/10 bg-white p-5">
      <h2 className="font-semibold">{copy.title}</h2>
      <ul className="mt-3 space-y-3">
        {checks.map(check => (
          <li key={check.control} className="text-sm">
            <strong>{controls[check.control] ?? check.control}</strong>: {copy.results[check.result]}
            <p>{reasons[check.reasonCode] ?? check.reasonCode}</p>
            {check.evidenceOn && <time dateTime={check.evidenceOn}>{new Date(check.evidenceOn).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}</time>}
          </li>
        ))}
      </ul>
    </section>
  );
}
