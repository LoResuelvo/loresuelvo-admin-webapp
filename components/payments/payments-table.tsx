import Link from "next/link";
import type { PaymentIntentSummary } from "./types";
import { formatMoney } from "./format";
import { PaymentFinancialDetails } from "./payment-financial-details";
import { PaymentPurposeBadge } from "./payment-purpose-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

export interface PaymentsTableProps {
  items: PaymentIntentSummary[];
  className?: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value));
}

function getAnomalyMessages(payment: PaymentIntentSummary): string[] {
  const copy = translations.payments.anomalies;
  const knownMessages = Object.entries(copy.messages);
  const codes = new Set([...payment.anomalies, ...payment.summary.anomalies]);
  return [...new Set([...codes].map((code) => (
    knownMessages.find(([knownCode]) => knownCode === code)?.[1] ?? copy.unknown
  )))];
}

function PaymentAmountSummary({ payment }: { payment: PaymentIntentSummary }) {
  const copy = translations.payments.summary;

  return (
    <div className="space-y-1 text-right">
      {payment.summary.approvedAmounts.length === 0 ? (
        <p className="text-xs text-[#536176]">{copy.noApprovedAmounts}</p>
      ) : (
        payment.summary.approvedAmounts.map((amount, index) => (
          <p key={`${amount.currency}-${index}`} className="whitespace-nowrap">
            <span className="text-xs text-[#536176]">{copy.approved}: </span>
            <span className="text-sm font-medium text-[#147560]">
              {formatMoney(amount.amountCents, amount.currency)}
            </span>
          </p>
        ))
      )}
      {payment.summary.pendingAmount && (
        <p className="whitespace-nowrap">
          <span className="text-xs text-[#536176]">{copy.pending}: </span>
          <span className="text-sm font-medium text-amber-800">
            {formatMoney(payment.summary.pendingAmount.amountCents, payment.summary.pendingAmount.currency)}
          </span>
        </p>
      )}
    </div>
  );
}

function PaymentAnomalyAlert({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  return (
    <div role="alert" className="mt-2 space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
      {messages.map((message) => <p key={message}>{message}</p>)}
    </div>
  );
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
            <th scope="col" className="px-4 py-3.5 text-right">{table.financialSummary}</th>
            <th scope="col" className="px-4 py-3.5">{table.status}</th>
            <th scope="col" className="px-4 py-3.5 whitespace-nowrap">{table.date}</th>
            <th scope="col" className="px-4 py-3.5">{table.details}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2B48]/5">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-[#F4F1EE]/30">
              <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                <span className="block text-sm text-[#1A2B48]">
                  {table.proposal} #{item.serviceProposalId}
                </span>
                <span className="block font-mono text-[11px] text-[#536176]">
                  {table.intentId}: <span>{item.id}</span>
                </span>
                {item.operationId && (
                  <Link
                    href={ROUTES.operationDetail(item.operationId)}
                    className="mt-1 inline-block font-mono text-xs text-[#147560] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
                  >
                    {table.operation}: {item.operationId}
                  </Link>
                )}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PaymentPurposeBadge purpose={item.purpose} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <Link
                  href={ROUTES.consumerDetail(item.consumerId)}
                  className="font-medium text-[#147560] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
                >
                  {item.consumerName ?? `${table.consumer} #${item.consumerId}`}
                </Link>
                {item.consumerName && (
                  <span className="block text-xs text-[#536176]">#{item.consumerId}</span>
                )}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <Link
                  href={ROUTES.providerDetail(item.providerId)}
                  className="font-medium text-[#147560] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
                >
                  {item.providerName ?? `${table.provider} #${item.providerId}`}
                </Link>
                {item.providerName && (
                  <span className="block text-xs text-[#536176]">#{item.providerId}</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                {formatMoney(item.totalAmountCents, item.currency)}
              </td>
              <td className="px-4 py-3.5 text-right">
                <PaymentAmountSummary payment={item} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PaymentStatusBadge status={item.status} />
                <PaymentAnomalyAlert messages={getAnomalyMessages(item)} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#536176]">
                {formatDate(item.createdOn)}
              </td>
              <td className="px-4 py-3.5 align-top">
                <details>
                  <summary className="cursor-pointer rounded-md font-medium text-[#147560] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]">
                    {table.showDetails}
                  </summary>
                  <PaymentFinancialDetails payment={item} />
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
