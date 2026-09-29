import { translations } from "@/infrastructure/i18n/translations";

export interface AuditTableItem {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorEmail: string;
  action: string;
  actionLabel?: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failure";
  metadata?: Record<string, unknown> | null;
}

export interface AuditTableProps {
  entries: readonly AuditTableItem[];
  emptyMessage?: string;
  className?: string;
  onSelectEntry?: (entry: AuditTableItem) => void;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return iso;
  }
}

function formatResource(resourceType: string, resourceId: string): string {
  if (resourceType === "operation" || resourceType === "hiring") {
    return `Contratación #${resourceId}`;
  }
  if (resourceType === "claim") {
    return `Reclamo #${resourceId}`;
  }
  if (resourceType === "payment") {
    return `Pago #${resourceId}`;
  }
  if (resourceType === "category") {
    return `Categoría #${resourceId}`;
  }
  if (resourceType === "provider") {
    return `Prestador #${resourceId}`;
  }
  return `${resourceType} #${resourceId}`;
}

function AuditTableEmpty({
  emptyMessage,
  className = "",
}: {
  emptyMessage?: string;
  className?: string;
}) {
  const copy = translations.audit;
  return (
    <div className={`rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center shadow-xs ${className}`.trim()}>
      <p className="text-sm font-medium text-[#536176]">
        {emptyMessage ?? copy.table.empty}
      </p>
    </div>
  );
}

function AuditTableRow({
  entry,
  onSelectEntry,
}: {
  entry: AuditTableItem;
  onSelectEntry?: (entry: AuditTableItem) => void;
}) {
  const copy = translations.audit;
  const actionLabel =
    entry.actionLabel ||
    copy.actions[entry.action as keyof typeof copy.actions] ||
    entry.action;

  const handleKeyDown = onSelectEntry
    ? (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectEntry(entry);
        }
      }
    : undefined;

  return (
    <tr
      onClick={onSelectEntry ? () => onSelectEntry(entry) : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={onSelectEntry ? 0 : undefined}
      className={`transition-colors hover:bg-[#F9F8F6] ${onSelectEntry ? "cursor-pointer focus:bg-[#F9F8F6] focus:outline-hidden" : ""}`}
    >
      <td className="whitespace-nowrap px-4 py-3.5 text-[#536176]">
        {formatDateTime(entry.timestamp)}
      </td>
      <td className="px-4 py-3.5 font-medium text-[#1A2B48]">
        {entry.operatorEmail}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-[#1A2B48]">
        {formatResource(entry.resourceType, entry.resourceId)}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <span className="inline-flex items-center rounded-md border border-[#1A2B48]/15 bg-[#F4F1EE] px-2 py-0.5 text-xs font-medium text-[#1A2B48]">
          {actionLabel}
        </span>
      </td>
      <td className="max-w-md px-4 py-3.5 text-[#536176] break-words">
        {entry.reason}
      </td>
    </tr>
  );
}

export function AuditTable({
  entries,
  emptyMessage,
  className = "",
  onSelectEntry,
}: AuditTableProps) {
  const copy = translations.audit;

  if (entries.length === 0) {
    return <AuditTableEmpty emptyMessage={emptyMessage} className={className} />;
  }

  return (
    <div className={`overflow-x-auto rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs ${className}`.trim()}>
      <table aria-label={copy.table.ariaLabel} className="min-w-full divide-y divide-[#1A2B48]/10 text-left text-sm">
        <thead className="bg-[#F8F7F5] text-xs font-semibold uppercase tracking-wider text-[#536176]">
          <tr>
            <th scope="col" className="px-4 py-3.5">{copy.table.date}</th>
            <th scope="col" className="px-4 py-3.5">{copy.table.operator}</th>
            <th scope="col" className="px-4 py-3.5">{copy.table.resource}</th>
            <th scope="col" className="px-4 py-3.5">{copy.table.action}</th>
            <th scope="col" className="px-4 py-3.5">{copy.table.reason}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {entries.map((entry) => (
            <AuditTableRow
              key={entry.id}
              entry={entry}
              onSelectEntry={onSelectEntry}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
