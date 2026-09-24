export interface MessageAttachment {
  readonly id: number;
  readonly fileName: string;
  readonly url: string;
}

export interface AuditedMessage {
  readonly id: number;
  readonly senderId: number;
  readonly senderRole: "consumer" | "provider";
  readonly content: string;
  readonly sentAt: string;
  readonly attachments: readonly MessageAttachment[];
}

export interface AuditedConversationResult {
  readonly items: readonly AuditedMessage[];
  readonly total: number;
}
