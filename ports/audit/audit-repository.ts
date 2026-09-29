import type { AuditFilters, AuditLogEntry } from "@/domain/audit/audit-log";

export interface AuditRepository {
  getAuditLogs(token: string, filters?: AuditFilters): Promise<AuditLogEntry[]>;
}
