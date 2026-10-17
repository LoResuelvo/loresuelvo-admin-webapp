export type AuditAction = "create" | "access" | "execute";

export type AuditResult = "succeeded" | "prepared" | "failed";

export type AuditLogEntry = Readonly<{
  id: string;
  operatorId: number;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  occurredOn: string;
  result: AuditResult;
  correlationId: string;
  reason?: string;
}>;

export type AuditLogsPage = Readonly<{
  events: readonly AuditLogEntry[];
  nextCursor: string | null;
}>;

export type AuditFilters = Readonly<{
  operatorId?: number;
  action?: AuditAction;
  from?: string;
  to?: string;
}>;
