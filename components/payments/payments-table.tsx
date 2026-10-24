import Link from "next/link";
import type { PaymentIntentSummary } from "./types";
import { formatMoney } from "./format";
import { PaymentDetailsDialog } from "./payment-details-dialog";
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

function PaymentParticipant({
  role,
  name,
  id,
  href,
}: {
  role: string;
  name?: string;
  id: number;
  href: string;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[11px] font-medium text-[#536176]">{role}</span>
      <Link
        href={href}
        className="block truncate font-medium text-[#147560] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {name ?? `${role} #${id}`}
      </Link>
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
    <div className={`admin-table-frame ${className}`.trim()}>
      <table aria-label={table.ariaLabel} className="w-full min-w-[700px] table-fixed text-left text-sm text-[#1A2B48]">
        <thead className="admin-table-heading">
          <tr>
            <th scope="col" className="px-3 py-3">{table.date}</th>
            <th scope="col" className="px-3 py-3">{table.participants}</th>
            <th scope="col" className="px-3 py-3">{table.purpose}</th>
            <th scope="col" className="px-3 py-3 text-right">{table.total}</th>
            <th scope="col" className="px-3 py-3">{table.status}</th>
            <th scope="col" className="px-3 py-3">{table.details}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e8ebee]">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-[#f8f9fa]">
              <td className="px-3 py-3 text-xs text-[#536176]">
                <time dateTime={item.createdOn}>{formatDate(item.createdOn)}</time>
              </td>
              <td className="space-y-2 px-3 py-3">
                <PaymentParticipant
                  role={table.consumer}
                  name={item.consumerName}
                  id={item.consumerId}
                  href={ROUTES.consumerDetail(item.consumerId)}
                />
                <PaymentParticipant
                  role={table.provider}
                  name={item.providerName}
                  id={item.providerId}
                  href={ROUTES.providerDetail(item.providerId)}
                />
              </td>
              <td className="px-3 py-3">
                <PaymentPurposeBadge purpose={item.purpose} />
              </td>
              <td className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                {formatMoney(item.totalAmountCents, item.currency)}
              </td>
              <td className="px-3 py-3">
                <PaymentStatusBadge status={item.status} />
                <PaymentAnomalyAlert messages={getAnomalyMessages(item)} />
              </td>
              <td className="px-3 py-3 align-top">
                <PaymentDetailsDialog payment={item} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
