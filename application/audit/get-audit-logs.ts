import type { AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";
import type { AuditRepository } from "@/ports/audit/audit-repository";

export async function getAuditLogs(
  repository: AuditRepository,
  token: string,
  filters?: AuditFilters,
): Promise<AuditLogEntry[]> {
  return repository.getAuditLogs(token, filters);
}
