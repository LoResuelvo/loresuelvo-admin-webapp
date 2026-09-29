export type AuditAction =
  | "chat_access"
  | "payment_reconcile"
  | "category_create"
  | "category_update"
  | "category_deactivate"
  | "provider_status_change"
  | "claim_resolution"
  | "review_moderation";

export type AuditLogEntry = Readonly<{
  id: string;
  timestamp: string;
  operatorId: string;
  operatorEmail: string;
  action: AuditAction;
  actionLabel: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  metadata?: Record<string, unknown> | null;
}>;

export type AuditFilters = Readonly<{
  operator?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
}>;
