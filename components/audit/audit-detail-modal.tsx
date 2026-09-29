import type { AuditLogEntry } from "@/domain/audit/audit-log";
import { Modal } from "@/components/ui/modal";
import { translations } from "@/infrastructure/i18n/translations";

export interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: AuditLogEntry | null;
}

export function sanitizeIpAddress(ip?: string): string {
  if (!ip) return "–";
  const ipv4Parts = ip.trim().split(".");
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.${ipv4Parts[2]}.xxx`;
  }
  const ipv6Parts = ip.trim().split(":");
  if (ipv6Parts.length > 1) {
    ipv6Parts[ipv6Parts.length - 1] = "xxxx";
    return ipv6Parts.join(":");
  }
  return ip;
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

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-medium text-[#536176]">{label}</span>
      <span className="text-[#1A2B48] break-words font-normal">{value}</span>
    </div>
  );
}

function ContextSection({ entry }: { entry: AuditLogEntry }) {
  const copy = translations.audit;
  const statusLabel =
    entry.status === "success" ? copy.status.success : copy.status.failure;

  return (
    <div className="space-y-3 rounded-xl border border-[#1A2B48]/10 bg-[#F8F7F5]/50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
        {copy.detail.context}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DetailItem label={copy.detail.operator} value={entry.operatorEmail} />
        <DetailItem label={copy.detail.action} value={entry.actionLabel} />
        <DetailItem
          label={copy.detail.resource}
          value={formatResource(entry.resourceType, entry.resourceId)}
        />
        <DetailItem
          label={copy.detail.date}
          value={formatDateTime(entry.timestamp)}
        />
        <DetailItem label={copy.detail.status} value={statusLabel} />
      </div>
      <DetailItem label={copy.detail.reason} value={entry.reason} />
    </div>
  );
}

function TechnicalSection({ entry }: { entry: AuditLogEntry }) {
  const copy = translations.audit;
  const sanitizedIp = sanitizeIpAddress(entry.ipAddress);

  return (
    <div className="space-y-3 rounded-xl border border-[#1A2B48]/10 bg-[#F8F7F5]/50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
        {copy.detail.technical}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DetailItem label={copy.detail.ip} value={sanitizedIp} />
        <DetailItem label={copy.detail.traceId} value={entry.id} />
      </div>
      <DetailItem label={copy.detail.userAgent} value={entry.userAgent} />
    </div>
  );
}

function MetadataSection({ metadata }: { metadata: Record<string, unknown> | null | undefined }) {
  const copy = translations.audit;
  if (!metadata || Object.keys(metadata).length === 0) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-[#536176]">
        {copy.detail.metadata}
      </span>
      <pre className="max-h-40 overflow-auto rounded-xl border border-[#1A2B48]/10 bg-[#F8F7F5] p-3 text-xs font-mono text-[#1A2B48]">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </div>
  );
}

export function AuditDetailModal({ isOpen, onClose, entry }: AuditDetailModalProps) {
  const copy = translations.audit;
  if (!entry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={copy.detail.title}
      className="max-w-xl"
    >
      <div className="space-y-4">
        <ContextSection entry={entry} />
        <TechnicalSection entry={entry} />
        <MetadataSection metadata={entry.metadata} />
      </div>
    </Modal>
  );
}
