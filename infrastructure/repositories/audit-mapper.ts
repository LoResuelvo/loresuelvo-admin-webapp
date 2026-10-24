import type { AuditLogEntry, AuditLogsPage } from "@/domain/audit/audit-log";
import {
  apiAuditLogsResponseSchema,
  type ApiAuditLogEntry,
} from "@/infrastructure/api/audit-types";

export function mapAuditLogEntry(dto: ApiAuditLogEntry): AuditLogEntry {
  return {
    id: dto.id,
    operatorId: dto.operator_id,
    ...(dto.operator_name?.trim() ? { operatorName: dto.operator_name.trim() } : {}),
    action: dto.action,
    resourceType: dto.resource_type,
    ...(dto.resource_id ? { resourceId: dto.resource_id } : {}),
    occurredOn: dto.occurred_on,
    result: dto.result,
    correlationId: dto.correlation_id,
    ...(dto.reason ? { reason: dto.reason } : {}),
  };
}

export function mapAuditLogsPage(raw: unknown): AuditLogsPage {
  const parsed = apiAuditLogsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid audit logs response");
  }

  return {
    events: parsed.data.events.map(mapAuditLogEntry),
    nextCursor: parsed.data.next_cursor,
  };
}
