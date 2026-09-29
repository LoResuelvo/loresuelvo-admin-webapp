import { z } from "zod";

export const apiAuditActionTypeSchema = z.enum([
  "chat_access",
  "payment_reconcile",
  "category_create",
  "category_update",
  "category_deactivate",
  "provider_status_change",
  "claim_resolution",
  "review_moderation",
]);

export const apiAuditLogEntrySchema = z.object({
  id: z.string().min(1),
  timestamp: z.string(),
  operator_id: z.string(),
  operator_email: z.string().email(),
  action: apiAuditActionTypeSchema,
  resource_type: z.string(),
  resource_id: z.string(),
  reason: z.string(),
  ip_address: z.string(),
  user_agent: z.string(),
  status: z.enum(["success", "failure"]),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const apiAuditLogsResponseSchema = z.array(apiAuditLogEntrySchema);

export type ApiAuditActionType = z.infer<typeof apiAuditActionTypeSchema>;
export type ApiAuditLogEntry = z.infer<typeof apiAuditLogEntrySchema>;
export type ApiAuditLogsResponse = z.infer<typeof apiAuditLogsResponseSchema>;
