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

const alertStyles: Record<OperationAlert, string> = {
  request_pending_over_24h: "border-amber-500 text-amber-900",
  booking_deadline_passed: "border-amber-500 text-amber-900",
  delayed: "border-red-500 text-red-800",
  stalled: "border-red-500 text-red-800",
};

function StatusBadge({ status }: { status: OperationStatus }) {
  const label = translations.operations.status[status];

  return (
    <span className="inline-flex max-w-full items-center rounded-sm bg-[#f1f3f5] px-2 py-1 text-xs font-medium leading-tight text-[#405064]">
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
          className={`inline-flex max-w-full items-center border-l-2 pl-2 text-xs font-medium ${alertStyles[alert]}`}
        >
          {labels[alert]}
        </span>
      ))}
    </div>
  );
}

export function OperationsTable({ operations, onSelectOperation }: OperationsTableProps) {
  return (
    <div className="admin-table-frame">
      <table aria-label={translations.operations.table.caption} className="w-full min-w-[700px] table-fixed text-left text-sm text-[#1A2B48]">
        <thead className="admin-table-heading">
          <tr>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.consumer}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.provider}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.category}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.status}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.bottleneck}</th>
            <th scope="col" className="px-3 py-3">{translations.operations.table.columns.responsible}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e8ebee]">
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
              className={`transition-colors hover:bg-[#f8f9fa] ${onSelectOperation ? "cursor-pointer focus:bg-[#F4F1EE]/50 focus:outline-none focus:ring-1 focus:ring-[#147560]" : ""}`.trim()}
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
