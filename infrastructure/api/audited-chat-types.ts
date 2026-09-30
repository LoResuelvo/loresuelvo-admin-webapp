import { z } from "zod";

const privateMediaSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url().refine((url) => /^https?:\/\//.test(url)),
  original_name: z.string(),
});

export const apiAuditedMessageItemSchema = z.object({
  id: z.number().int().positive(),
  sender_role: z.enum(["consumer", "provider"]),
  content: z.string(),
  created_on: z.string().datetime({ offset: true }),
  images: z.array(privateMediaSchema).optional(),
  audio: privateMediaSchema.extend({
    mime_type: z.string(),
    codec: z.string(),
    duration_seconds: z.number().int().positive(),
  }).optional(),
  video: privateMediaSchema.extend({
    mime_type: z.string(),
    video_codec: z.string(),
    audio_codec: z.string().optional(),
    duration_seconds: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }).optional(),
});

export const apiAuditedConversationResponseSchema = z.object({
  operation_id: z.string().regex(/^(jr|sp)-[1-9][0-9]*$/),
  conversation_id: z.number().int().positive(),
  job_request_id: z.number().int().positive().nullable(),
  service_proposal_id: z.number().int().positive().nullable(),
  related_service_proposal_ids: z.array(z.number().int().positive()),
  shared_conversation: z.boolean(),
  messages: z.array(apiAuditedMessageItemSchema),
  next_cursor: z.string().nullable(),
});

export type ApiAuditedMessageItem = z.infer<typeof apiAuditedMessageItemSchema>;
export type ApiAuditedConversationResponse = z.infer<typeof apiAuditedConversationResponseSchema>;
