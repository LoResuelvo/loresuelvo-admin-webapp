import Link from "next/link";
import type { ReactNode } from "react";
import type { PaymentIntentSummary } from "./types";
import { formatMoney } from "./format";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

interface PaymentFinancialDetailsProps {
  payment: PaymentIntentSummary;
}

function formatPaymentDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value));
}

function formatNullableMoney(value: number | null, currency: string): string {
  if (value === null) return translations.payments.detail.notReported;
  return formatMoney(value, currency);
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-[#1A2B48]/5 py-2 last:border-b-0 sm:grid-cols-[minmax(11rem,1fr)_minmax(0,1.2fr)] sm:gap-4">
      <dt className="text-xs text-[#536176]">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-[#1A2B48]">{children}</dd>
    </div>
  );
}

export function PaymentFinancialDetails({ payment }: PaymentFinancialDetailsProps) {
  const copy = translations.payments.detail;
  const { breakdown, summary } = payment;

  return (
    <div className="mt-3 max-w-2xl space-y-5 rounded-lg border border-[#1A2B48]/10 bg-white p-4 text-left whitespace-normal shadow-sm">
      <section aria-label={copy.financialSummary}>
        <h3 className="mb-2 text-sm font-semibold text-[#1A2B48]">{copy.financialSummary}</h3>
        <dl>
          <DetailRow label={copy.approvedAmounts}>
            {summary.approvedAmounts.length === 0 ? (
              copy.noApprovedAmounts
            ) : (
              <ul className="space-y-1">
                {summary.approvedAmounts.map((amount, index) => (
                  <li key={`${amount.currency}-${index}`}>
                    {formatMoney(amount.amountCents, amount.currency)}
                  </li>
                ))}
              </ul>
            )}
          </DetailRow>
          <DetailRow label={copy.pendingAmount}>
            {summary.pendingAmount
              ? formatMoney(summary.pendingAmount.amountCents, summary.pendingAmount.currency)
              : translations.payments.summary.noPendingAmount}
          </DetailRow>
          <DetailRow label={copy.sellerAmount}>
            <div>
              <p>{formatMoney(payment.sellerAmountCents, payment.currency)}</p>
              <p className="mt-1 text-xs font-normal text-[#536176]">{copy.sellerAmountHelp}</p>
            </div>
          </DetailRow>
          <DetailRow label={copy.platformFee}>
            {formatMoney(payment.platformFeeCents, payment.currency)}
          </DetailRow>
        </dl>
      </section>

      <section aria-label={copy.breakdown}>
        <h3 className="mb-2 text-sm font-semibold text-[#1A2B48]">{copy.breakdown}</h3>
        <dl>
          <DetailRow label={copy.serviceTotal}>
            {formatMoney(breakdown.serviceTotalCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.deposit}>
            {formatMoney(breakdown.depositCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.platformFeeTotal}>
            {formatMoney(breakdown.platformFeeTotalCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.platformFeeDueNow}>
            {formatMoney(breakdown.platformFeeDueNowCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.amountDueNow}>
            {formatNullableMoney(breakdown.amountDueNowCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.remainingServiceBalance}>
            {formatNullableMoney(breakdown.remainingServiceBalanceCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.remainingPlatformFee}>
            {formatNullableMoney(breakdown.remainingPlatformFeeCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.remainingAmountDue}>
            {formatNullableMoney(breakdown.remainingAmountDueCents, breakdown.currency)}
          </DetailRow>
          <DetailRow label={copy.bookingPaymentDeadline}>
            {formatPaymentDate(breakdown.bookingPaymentDeadline)}
          </DetailRow>
        </dl>
      </section>

      <section aria-label={copy.references}>
        <h3 className="mb-2 text-sm font-semibold text-[#1A2B48]">{copy.references}</h3>
        <dl>
          <DetailRow label={copy.paymentIntentId}>
            <span className="font-mono text-xs">{payment.id}</span>
          </DetailRow>
          <DetailRow label={copy.consumerId}>#{payment.consumerId}</DetailRow>
          <DetailRow label={copy.providerId}>#{payment.providerId}</DetailRow>
          {payment.operationId && (
            <DetailRow label={copy.operationId}>
              <Link
                href={ROUTES.operationDetail(payment.operationId)}
                className="text-[#147560] underline underline-offset-2"
              >
                {payment.operationId}
              </Link>
            </DetailRow>
          )}
          <DetailRow label={copy.serviceProposalId}>#{payment.serviceProposalId}</DetailRow>
          <DetailRow label={copy.workOrderId}>
            {payment.workOrderId === null ? copy.noWorkOrder : `#${payment.workOrderId}`}
          </DetailRow>
        </dl>
      </section>

      <section aria-label={copy.transactions}>
        <h3 className="mb-2 text-sm font-semibold text-[#1A2B48]">{copy.transactions}</h3>
        {payment.transactions.length === 0 ? (
          <p className="text-sm text-[#536176]">{copy.noTransactions}</p>
        ) : (
          <ul className="space-y-3">
            {payment.transactions.map((transaction) => (
              <li key={transaction.id} className="rounded-md bg-[#F4F1EE]/60 p-3">
                <h4 className="mb-1 text-xs font-semibold text-[#1A2B48]">
                  {copy.transaction} #{transaction.id}
                </h4>
                <dl>
                  <DetailRow label={copy.processor}>{transaction.processor}</DetailRow>
                  <DetailRow label={copy.transactionStatus}>
                    <span className="font-mono text-xs">{transaction.status}</span>
                  </DetailRow>
                  <DetailRow label={copy.externalPaymentId}>
                    <span className="font-mono text-xs">{transaction.externalPaymentId}</span>
                  </DetailRow>
                  <DetailRow label={copy.transactionAmount}>
                    {formatMoney(transaction.amountCents, transaction.currency)}
                  </DetailRow>
                  <DetailRow label={copy.processorFee}>
                    {formatNullableMoney(transaction.processorFeeCents, transaction.currency)}
                  </DetailRow>
                  <DetailRow label={copy.netSettlement}>
                    {formatNullableMoney(transaction.netSettlementCents, transaction.currency)}
                  </DetailRow>
                  <DetailRow label={copy.verifiedOn}>
                    {transaction.verifiedOn
                      ? formatPaymentDate(transaction.verifiedOn)
                      : copy.notReported}
                  </DetailRow>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
