import type { AuditLogEntry } from "@/domain/audit/audit-log";
import {
  apiAuditLogsResponseSchema,
  type ApiAuditLogEntry,
} from "@/infrastructure/api/audit-types";
import { translations } from "@/infrastructure/i18n/translations";

export function mapAuditLogEntry(dto: ApiAuditLogEntry): AuditLogEntry {
  const copy = translations.audit.actions;
  const actionLabel = copy[dto.action] ?? dto.action;

  return {
    id: dto.id,
    timestamp: dto.timestamp,
    operatorId: dto.operator_id,
    operatorEmail: dto.operator_email,
    action: dto.action,
    actionLabel,
    resourceType: dto.resource_type,
    resourceId: dto.resource_id,
    reason: dto.reason,
    ipAddress: dto.ip_address,
    userAgent: dto.user_agent,
    status: dto.status,
    metadata: dto.metadata ?? null,
  };
}

export function mapAuditLogsList(raw: unknown): AuditLogEntry[] {
  const parsed = apiAuditLogsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid audit logs response");
  }
  return parsed.data.map(mapAuditLogEntry);
}
