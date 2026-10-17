import type { PaymentIntentSummary } from "./types";
import { formatMoney } from "./format";
import { PaymentPurposeBadge } from "./payment-purpose-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import { translations } from "@/infrastructure/i18n/translations";

export interface PaymentsTableProps {
  items: PaymentIntentSummary[];
  className?: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PaymentsTable({ items, className = "" }: PaymentsTableProps) {
  const { table } = translations.payments;

  return (
    <div className={`overflow-x-auto rounded-xl border border-[#1A2B48]/10 bg-white shadow-sm ${className}`.trim()}>
      <table className="w-full text-left text-sm text-[#1A2B48]">
        <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#536176]">
          <tr>
            <th scope="col" className="px-4 py-3.5">{table.reference}</th>
            <th scope="col" className="px-4 py-3.5">{table.purpose}</th>
            <th scope="col" className="px-4 py-3.5">{table.consumer}</th>
            <th scope="col" className="px-4 py-3.5">{table.provider}</th>
            <th scope="col" className="px-4 py-3.5 text-right">{table.total}</th>
            <th scope="col" className="px-4 py-3.5 text-right">{table.sellerNet}</th>
            <th scope="col" className="px-4 py-3.5 text-right">{table.platformFee}</th>
            <th scope="col" className="px-4 py-3.5">{table.status}</th>
            <th scope="col" className="px-4 py-3.5">{table.date}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-[#F4F1EE]/30 transition-colors">
              <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                <span className="block font-mono text-xs text-[#1A2B48]">{item.id}</span>
                <span className="block text-[11px] text-[#536176]">
                  {table.proposal} #{item.serviceProposalId}
                  {item.workOrderId !== null && ` · ${table.workOrder} #${item.workOrderId}`}
                </span>
                {item.transactions.map((transaction) => (
                  <span key={transaction.id} className="block text-[11px] text-[#536176] font-mono">
                    {table.transaction}: {transaction.externalPaymentId}
                  </span>
                ))}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PaymentPurposeBadge purpose={item.purpose} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">#{item.consumerId}</td>
              <td className="px-4 py-3.5 whitespace-nowrap">#{item.providerId}</td>
              <td className="px-4 py-3.5 text-right font-medium whitespace-nowrap">
                {formatMoney(item.totalAmountCents, item.currency)}
              </td>
              <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#147560] font-medium">
                {formatMoney(item.sellerAmountCents, item.currency)}
              </td>
              <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#536176]">
                {formatMoney(item.platformFeeCents, item.currency)}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PaymentStatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#536176]">
                {formatDate(item.createdOn)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
