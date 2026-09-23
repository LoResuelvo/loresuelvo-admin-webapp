import type { OrderDetail } from "@/domain/operations/unified-operation-detail";
import { translations } from "@/infrastructure/i18n/translations";

export interface OperationOrderCardProps {
  readonly order?: OrderDetail | null;
}

function formatScheduledDate(isoString?: string | null): string {
  if (!isoString) return translations.operations.order.notScheduled;
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

export function OperationOrderCard({ order }: OperationOrderCardProps) {
  const copy = translations.operations.order;

  if (!order) {
    return null;
  }

  const statusLabel =
    copy.status[order.status as keyof typeof copy.status] ?? order.status;

  return (
    <section
      data-testid="operation-order-card"
      aria-label={copy.title}
      className="space-y-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2B48]/10 pb-4">
        <div>
          <h2 className="text-base font-semibold text-[#1A2B48]">{copy.title}</h2>
          <p className="mt-0.5 text-xs text-[#536176]">{copy.subtitle}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#1A2B48]/10 px-3 py-1 text-xs font-semibold text-[#1A2B48]">
          {statusLabel}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/40 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
            Estado de la orden
          </span>
          <p className="mt-1 text-lg font-bold tracking-tight text-[#1A2B48]">
            {statusLabel}
          </p>
        </div>

        <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/40 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
            {copy.scheduledFor}
          </span>
          <p className="mt-1 text-base font-semibold capitalize text-[#1A2B48]">
            {formatScheduledDate(order.scheduledFor)}
          </p>
        </div>
      </div>
    </section>
  );
}
