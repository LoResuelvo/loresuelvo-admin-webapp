import type {
  ActionResponsible,
  BottleneckType,
  OperationParty,
  OperationStatus,
  OperationSummary,
} from "@/domain/operations/operation-summary";
import { BottleneckBadge } from "./bottleneck-badge";
import { ResponsibleBadge } from "./responsible-badge";

export type {
  ActionResponsible,
  BottleneckType,
  OperationParty,
  OperationStatus,
  OperationSummary,
};

export interface OperationsTableProps {
  operations: readonly OperationSummary[];
  onSelectOperation?: (operation: OperationSummary) => void;
}

const statusLabels: Record<OperationStatus, string> = {
  requested: "Solicitado",
  quoted: "Cotizado",
  in_progress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<OperationStatus, string> = {
  requested: "bg-blue-50 text-blue-700 border-blue-200",
  quoted: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-300",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function StatusBadge({ status }: { status: OperationStatus }) {
  const label = statusLabels[status] ?? status;
  const style = statusStyles[status] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

export function OperationsTable({ operations, onSelectOperation }: OperationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs">
      <table aria-label="Bandeja de operaciones" className="w-full text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
          <tr>
            <th scope="col" className="px-6 py-4">Cliente</th>
            <th scope="col" className="px-6 py-4">Prestador</th>
            <th scope="col" className="px-6 py-4">Rubro</th>
            <th scope="col" className="px-6 py-4">Estado</th>
            <th scope="col" className="px-6 py-4">Alerta Operativa</th>
            <th scope="col" className="px-6 py-4">Responsable</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {operations.map((op) => (
            <tr
              key={op.id}
              onClick={() => onSelectOperation?.(op)}
              className={`transition-colors hover:bg-[#F4F1EE]/30 ${onSelectOperation ? "cursor-pointer" : ""}`.trim()}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-[#1A2B48]">
                  {op.consumer.name} {op.consumer.surname}
                </div>
                <div className="text-xs text-[#536176]">{op.consumer.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-[#1A2B48]">
                  {op.provider.name} {op.provider.surname}
                </div>
                <div className="text-xs text-[#536176]">{op.provider.email}</div>
              </td>
              <td className="px-6 py-4 font-medium text-[#1A2B48] whitespace-nowrap">
                {op.category.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={op.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <BottleneckBadge bottleneck={op.bottleneck} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ResponsibleBadge responsible={op.nextActionBy} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
