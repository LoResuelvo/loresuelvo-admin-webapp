import type {
  ActionResponsible,
  BottleneckType,
  OperationAlert,
  OperationParty,
  OperationStatus,
  OperationSummary,
} from "@/domain/operations/operation-summary";
import { translations } from "@/infrastructure/i18n/translations";
import { BottleneckBadge } from "./bottleneck-badge";
import { ResponsibleBadge } from "./responsible-badge";

export type {
  ActionResponsible,
  BottleneckType,
  OperationAlert,
  OperationParty,
  OperationStatus,
  OperationSummary,
};

export interface OperationsTableProps {
  operations: readonly OperationSummary[];
  onSelectOperation?: (operation: OperationSummary) => void;
}

const statusStyles: Partial<Record<OperationStatus, string>> = {
  request_pending: "bg-blue-50 text-blue-700 border-blue-200",
  request_accepted: "bg-cyan-50 text-cyan-800 border-cyan-200",
  proposal_pending: "bg-amber-50 text-amber-700 border-amber-200",
  proposal_accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  proposal_rejected: "bg-rose-50 text-rose-700 border-rose-200",
  work_order_scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  work_order_awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
  work_order_paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  requested: "bg-blue-50 text-blue-700 border-blue-200",
  quoted: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-300",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const alertStyles: Record<OperationAlert, string> = {
  request_pending_over_24h: "border-amber-200 bg-amber-50 text-amber-900",
  booking_deadline_passed: "border-orange-200 bg-orange-50 text-orange-900",
  delayed: "border-rose-200 bg-rose-50 text-rose-900",
  stalled: "border-red-200 bg-red-50 text-red-900",
};

function StatusBadge({ status }: { status: OperationStatus }) {
  const label = translations.operations.status[status];
  const style = statusStyles[status] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex max-w-full items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-tight ${style}`}>
      {label}
    </span>
  );
}

function OperationAlertBadges({ alerts }: { alerts: readonly OperationAlert[] }) {
  const labels = translations.operations.alerts;

  return (
    <div className="flex flex-wrap gap-1.5">
      {alerts.map((alert) => (
        <span
          key={alert}
          className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-xs font-medium ${alertStyles[alert]}`}
        >
          {labels[alert]}
        </span>
      ))}
    </div>
  );
}

export function OperationsTable({ operations, onSelectOperation }: OperationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs">
      <table aria-label={translations.operations.table.caption} className="w-full min-w-[700px] table-fixed text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
          <tr>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.consumer}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.provider}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.category}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.status}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.bottleneck}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.responsible}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {operations.map((op) => (
            <tr
              key={op.id}
              onClick={() => onSelectOperation?.(op)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectOperation?.(op);
                }
              }}
              tabIndex={onSelectOperation ? 0 : undefined}
              className={`transition-colors hover:bg-[#F4F1EE]/30 ${onSelectOperation ? "cursor-pointer focus:bg-[#F4F1EE]/50 focus:outline-none focus:ring-1 focus:ring-[#147560]" : ""}`.trim()}
            >

              <td className="min-w-0 px-3 py-3">
                <div className="truncate font-medium text-[#1A2B48]">
                  {op.consumer.name} {op.consumer.surname}
                </div>
                {op.consumer.email && <div className="truncate text-xs text-[#536176]">{op.consumer.email}</div>}
              </td>
              <td className="min-w-0 px-3 py-3">
                <div className="truncate font-medium text-[#1A2B48]">
                  {op.provider.name} {op.provider.surname}
                </div>
                {op.provider.email && <div className="truncate text-xs text-[#536176]">{op.provider.email}</div>}
              </td>
              <td className="px-3 py-3 font-medium text-[#1A2B48]">
                {op.category?.name ?? translations.operations.unavailable}
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={op.status} />
              </td>
              <td className="px-3 py-3">
                {op.alerts?.length ? (
                  <OperationAlertBadges alerts={op.alerts} />
                ) : (
                  <BottleneckBadge bottleneck={op.bottleneck ?? "none"} />
                )}
              </td>
              <td className="px-3 py-3">
                <ResponsibleBadge responsible={op.nextActionBy} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
