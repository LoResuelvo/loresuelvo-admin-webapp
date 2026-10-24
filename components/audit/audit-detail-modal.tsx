import type { AuditLogEntry } from "@/domain/audit/audit-log";
import { Modal } from "@/components/ui/modal";
import { translations } from "@/infrastructure/i18n/translations";
import { formatAuditDateTime, formatAuditResource } from "./audit-formatters";

export interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: AuditLogEntry | null;
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

  return (
    <div className="space-y-3 rounded-xl border border-[#1A2B48]/10 bg-[#F8F7F5]/50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
        {copy.detail.context}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailItem label={copy.detail.operator} value={entry.operatorName || entry.operatorId} />
        <DetailItem label={copy.detail.action} value={copy.actions[entry.action]} />
        <DetailItem
          label={copy.detail.resource}
          value={formatAuditResource(entry.resourceType, entry.resourceId, copy.notAvailable)}
        />
        <DetailItem
          label={copy.detail.date}
          value={formatAuditDateTime(entry.occurredOn)}
        />
        <DetailItem label={copy.detail.result} value={copy.results[entry.result]} />
      </div>
      <DetailItem
        label={copy.detail.reason}
        value={entry.reason || copy.notAvailable}
      />
    </div>
  );
}

function TraceabilitySection({ entry }: { entry: AuditLogEntry }) {
  const copy = translations.audit;

  return (
    <div className="space-y-3 rounded-xl border border-[#1A2B48]/10 bg-[#F8F7F5]/50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
        {copy.detail.traceability}
      </h3>
      {entry.operatorName && <DetailItem label={copy.detail.operatorId} value={entry.operatorId} />}
      <DetailItem label={copy.detail.correlationId} value={entry.correlationId} />
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
        <TraceabilitySection entry={entry} />
      </div>
    </Modal>
  );
}
