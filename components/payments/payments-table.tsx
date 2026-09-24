import type { PaymentIntentSummary } from "./types";
import { formatMoneyArs } from "./format";
import { PaymentPurposeBadge } from "./payment-purpose-badge";
import { PaymentStatusBadge } from "./payment-status-badge";

export interface PaymentsTableProps {
  items: PaymentIntentSummary[];
  className?: string;
}

export function PaymentsTable({ items, className = "" }: PaymentsTableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-[#1A2B48]/10 bg-white shadow-sm ${className}`.trim()}>
      <table className="w-full text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#536176]">
          <tr>
            <th scope="col" className="px-4 py-3.5">Referencia / ID</th>
            <th scope="col" className="px-4 py-3.5">Propósito</th>
            <th scope="col" className="px-4 py-3.5">Cliente</th>
            <th scope="col" className="px-4 py-3.5">Prestador</th>
            <th scope="col" className="px-4 py-3.5 text-right">Total</th>
            <th scope="col" className="px-4 py-3.5 text-right">Neto prestador</th>
            <th scope="col" className="px-4 py-3.5 text-right">Comisión plataforma</th>
            <th scope="col" className="px-4 py-3.5">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-[#F4F1EE]/30 transition-colors">
              <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                <span className="block font-mono text-xs text-[#1A2B48]">
                  {item.externalReference || `#${item.id}`}
                </span>
                {item.externalPaymentId && (
                  <span className="block text-[11px] text-[#536176] font-mono">
                    {item.externalPaymentId}
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PaymentPurposeBadge purpose={item.purpose} />
              </td>
              <td className="px-4 py-3.5">
                <span className="block font-medium">{item.consumer.name}</span>
                <span className="block text-xs text-[#536176]">{item.consumer.email}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className="block font-medium">{item.provider.name}</span>
                <span className="block text-xs text-[#536176]">{item.provider.email}</span>
              </td>
              <td className="px-4 py-3.5 text-right font-medium whitespace-nowrap">
                {formatMoneyArs(item.breakdown.serviceAmountCents)}
              </td>
              <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#147560] font-medium">
                {formatMoneyArs(item.breakdown.sellerAmountCents)}
              </td>
              <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#536176]">
                {formatMoneyArs(item.breakdown.platformFeeCents)}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PaymentStatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
