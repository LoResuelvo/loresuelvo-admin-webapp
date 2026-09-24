import type { AuditedMessage } from "@/domain/operations/audited-message";
import { translations } from "@/infrastructure/i18n/translations";

export interface AuditedMessagesListProps {
  readonly messages: readonly AuditedMessage[];
  readonly consumerName?: string;
  readonly providerName?: string;
}

function formatMessageTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

interface AuditedMessageItemProps {
  readonly message: AuditedMessage;
  readonly consumerName?: string;
  readonly providerName?: string;
}

function AuditedMessageItem({
  message,
  consumerName,
  providerName,
}: AuditedMessageItemProps) {
  const isConsumer = message.senderRole === "consumer";
  const roleLabel = isConsumer
    ? translations.operations.chat.clientRole
    : translations.operations.chat.providerRole;
  const displayName = isConsumer
    ? consumerName ? `${consumerName} (${roleLabel})` : roleLabel
    : providerName ? `${providerName} (${roleLabel})` : roleLabel;

  const testId = isConsumer
    ? "audited-message-consumer"
    : "audited-message-provider";

  return (
    <article
      data-testid={testId}
      aria-label={`Mensaje de ${roleLabel}`}
      className={`flex flex-col gap-1 rounded-xl p-3.5 text-sm transition-all ${
        isConsumer
          ? "bg-[#147560]/10 border border-[#147560]/20 mr-6 self-start text-[#1A2B48]"
          : "bg-blue-50/70 border border-blue-200 ml-6 self-end text-[#1A2B48]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-[#147560]">{displayName}</span>
        <time dateTime={message.sentAt} className="text-[#536176] font-mono text-[11px]">
          {formatMessageTime(message.sentAt)}
        </time>
      </div>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed">{message.content}</p>
      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-[#1A2B48]/10">
          {message.attachments.map((att) => (
            <a
              key={att.id}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-[#147560] border border-[#147560]/20 hover:bg-white transition-colors"
            >
              <span>📎</span>
              <span className="truncate max-w-[150px]">{att.fileName}</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

export function AuditedMessagesList({
  messages,
  consumerName,
  providerName,
}: AuditedMessagesListProps) {
  if (messages.length === 0) {
    return (
      <div
        data-testid="audited-messages-empty"
        className="rounded-xl border border-dashed border-[#1A2B48]/20 bg-[#F4F1EE]/30 p-8 text-center"
      >
        <p className="text-sm font-medium text-[#536176]">
          {translations.operations.chat.empty}
        </p>
      </div>
    );
  }

  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.sentAt).getTime();
    const timeB = new Date(b.sentAt).getTime();
    return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
  });

  return (
    <div
      data-testid="audited-messages-list"
      role="feed"
      aria-label="Mensajes de la conversación"
      className="space-y-4 max-h-[60vh] overflow-y-auto p-1"
    >
      {sortedMessages.map((message) => (
        <AuditedMessageItem
          key={message.id}
          message={message}
          consumerName={consumerName}
          providerName={providerName}
        />
      ))}
    </div>
  );
}
