export function formatAuditDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return iso;
  }
}

export function formatAuditResource(
  resourceType: string,
  resourceId: string | undefined,
  notAvailable: string,
): string {
  if (!resourceId) return `${resourceType} — ${notAvailable}`;
  if (resourceType === "operation" || resourceType === "hiring") {
    return `Contratación #${resourceId}`;
  }
  if (resourceType === "claim") {
    return `Reclamo #${resourceId}`;
  }
  if (resourceType === "payment") {
    return `Pago #${resourceId}`;
  }
  if (resourceType === "category") {
    return `Categoría #${resourceId}`;
  }
  if (resourceType === "provider") {
    return `Prestador #${resourceId}`;
  }
  return `${resourceType} #${resourceId}`;
}
