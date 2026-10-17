import { z } from "zod";

export const apiAuditActionTypeSchema = z.enum(["create", "access", "execute"]);

export const apiAuditResultSchema = z.enum(["succeeded", "prepared", "failed"]);

export const apiAuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  operator_id: z.number().int().positive(),
  action: apiAuditActionTypeSchema,
  resource_type: z.string().min(1),
  resource_id: z.string().optional(),
  occurred_on: z.string().datetime({ offset: true }),
  result: apiAuditResultSchema,
  correlation_id: z.string().min(1),
  reason: z.string().optional(),
});

export const apiAuditLogsResponseSchema = z.object({
  events: z.array(apiAuditLogEntrySchema),
  next_cursor: z.string().nullable(),
});

export type ApiAuditActionType = z.infer<typeof apiAuditActionTypeSchema>;
export type ApiAuditResult = z.infer<typeof apiAuditResultSchema>;
export type ApiAuditLogEntry = z.infer<typeof apiAuditLogEntrySchema>;
export type ApiAuditLogsResponse = z.infer<typeof apiAuditLogsResponseSchema>;
