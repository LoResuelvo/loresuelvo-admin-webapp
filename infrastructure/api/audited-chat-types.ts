import { z } from "zod";

export const apiAuditedMessageAttachmentSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(Number),
  file_name: z.string().optional(),
  fileName: z.string().optional(),
  url: z.string(),
});

export type ApiAuditedMessageAttachment = z.infer<
  typeof apiAuditedMessageAttachmentSchema
>;

export const apiAuditedMessageItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(Number),
  sender_id: z.union([z.string(), z.number()]).transform(Number).optional(),
  senderId: z.union([z.string(), z.number()]).transform(Number).optional(),
  sender_role: z.enum(["consumer", "provider"]).optional(),
  senderRole: z.enum(["consumer", "provider"]).optional(),
  content: z.string().default(""),
  sent_at: z.string().optional(),
  sentAt: z.string().optional(),
  attachments: z.array(apiAuditedMessageAttachmentSchema).default([]),
});

export type ApiAuditedMessageItem = z.infer<typeof apiAuditedMessageItemSchema>;

export const apiAuditedConversationResponseSchema = z.union([
  z.object({
    items: z.array(apiAuditedMessageItemSchema),
    pagination: z
      .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        total: z.number().optional(),
      })
      .optional(),
    total: z.number().optional(),
  }),
  z.object({
    data: z.object({
      items: z.array(apiAuditedMessageItemSchema),
      pagination: z
        .object({
          page: z.number().optional(),
          limit: z.number().optional(),
          total: z.number().optional(),
        })
        .optional(),
      total: z.number().optional(),
    }),
  }),
  z.array(apiAuditedMessageItemSchema),
]);

export type ApiAuditedConversationResponse = z.infer<
  typeof apiAuditedConversationResponseSchema
>;
