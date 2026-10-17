import type { AuditFilters, AuditLogsPage } from "@/domain/audit/audit-log";

export interface AuditRepository {
  getAuditLogs(
    token: string,
    filters?: AuditFilters,
    cursor?: string,
  ): Promise<AuditLogsPage>;
}
