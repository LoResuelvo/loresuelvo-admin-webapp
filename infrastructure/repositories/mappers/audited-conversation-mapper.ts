import type { AuditedConversationResult, AuditedMessage } from "@/domain/operations/audited-message";
import { apiAuditedConversationResponseSchema, type ApiAuditedMessageItem } from "@/infrastructure/api/types";

function mapMessage(message: ApiAuditedMessageItem): AuditedMessage {
  const media = [...(message.images ?? []), ...(message.audio ? [message.audio] : []), ...(message.video ? [message.video] : [])];
  return {
    id: message.id,
    senderRole: message.sender_role,
    content: message.content,
    sentAt: message.created_on,
    attachments: media.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.original_name,
      url: attachment.url,
    })),
  };
}

export function mapAuditedConversation(raw: unknown): AuditedConversationResult {
  const parsed = apiAuditedConversationResponseSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid audited conversation data");
  return {
    items: parsed.data.messages.map(mapMessage),
    total: parsed.data.messages.length,
    nextCursor: parsed.data.next_cursor,
    sharedConversation: parsed.data.shared_conversation,
  };
}
