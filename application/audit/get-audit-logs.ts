import type { AuditFilters, AuditLogsPage } from "@/domain/audit/audit-log";
import type { AuditRepository } from "@/ports/audit/audit-repository";

export async function getAuditLogs(
  repository: AuditRepository,
  token: string,
  filters?: AuditFilters,
  cursor?: string,
): Promise<AuditLogsPage> {
  return repository.getAuditLogs(token, filters, cursor);
}
