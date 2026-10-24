import { translations } from "@/infrastructure/i18n/translations";

export function formatAuditDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const formatted = new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).format(date);
    return `${formatted} (${translations.audit.timeZone})`;
  } catch {
    return iso;
  }
}

export function formatAuditResource(
  resourceType: string,
  resourceId: string | undefined,
  notAvailable: string,
): string {
  const resources: Readonly<Record<string, string>> = translations.audit.resources;
  const label = resources[resourceType] ?? translations.audit.table.resource;
  return resourceId ? `${label} #${resourceId}` : `${label} — ${notAvailable}`;
}
