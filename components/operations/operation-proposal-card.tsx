import type { ProposalDetail } from "@/domain/operations/unified-operation-detail";
import { Money } from "@/domain/shared/Money";
import { translations } from "@/infrastructure/i18n/translations";

export interface OperationProposalCardProps {
  readonly proposals?: readonly ProposalDetail[];
}

function formatDate(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
    }).format(date);
  } catch {
    return isoString;
  }
}

function formatCents(cents: number): string {
  try {
    return Money.format(Money.create(cents, "ARS"));
  } catch {
    return `$ ${(cents / 100).toLocaleString("es-AR")}`;
  }
}

function ProposalCardHeader({ status }: { status: string }) {
  const copy = translations.operations.proposal;
  const statusLabel = copy.status[status as keyof typeof copy.status] ?? status;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2B48]/10 pb-4">
      <div>
        <h2 className="text-base font-semibold text-[#1A2B48]">{copy.title}</h2>
        <p className="mt-0.5 text-xs text-[#536176]">{copy.subtitle}</p>
      </div>
      <span className="inline-flex items-center rounded-full bg-[#147560]/10 px-3 py-1 text-xs font-semibold text-[#147560]">
        {statusLabel}
      </span>
    </header>
  );
}

function ProposalCommercialGrid({ proposal }: { proposal: ProposalDetail }) {
  const copy = translations.operations.proposal;
  const depositPercent =
    proposal.amountCents > 0
      ? Math.round((proposal.bookingDepositCents / proposal.amountCents) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/40 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
          {copy.totalAmount}
        </span>
        <p className="mt-1 text-xl font-bold tracking-tight text-[#1A2B48]">
          {formatCents(proposal.amountCents)}
        </p>
      </div>

      <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/40 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
          {copy.bookingDeposit}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-xl font-bold tracking-tight text-[#1A2B48]">
            {formatCents(proposal.bookingDepositCents)}
          </p>
          {depositPercent > 0 && (
            <span className="text-xs font-semibold text-[#147560]">
              ({depositPercent}% {copy.depositPercentage})
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/40 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
          {copy.estimatedDuration}
        </span>
        <p className="mt-1 text-base font-semibold text-[#1A2B48]">
          {proposal.estimatedDuration || "—"}
        </p>
      </div>

      <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/40 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
          {copy.committedDates}
        </span>
        <p className="mt-1 text-base font-semibold text-[#1A2B48]">
          {formatDate(proposal.createdAt) || "—"}
        </p>
      </div>
    </div>
  );
}

function ProposalDescription({ description }: { description: string }) {
  const copy = translations.operations.proposal;
  return (
    <div className="rounded-xl border border-[#1A2B48]/10 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
        {copy.description}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#1A2B48]">{description}</p>
    </div>
  );
}

export function OperationProposalCard({ proposals = [] }: OperationProposalCardProps) {
  if (proposals.length === 0) {
    return null;
  }

  const activeProposal =
    proposals.find((p) => p.status === "accepted") ?? proposals[proposals.length - 1];

  return (
    <section
      data-testid="operation-proposal-card"
      aria-label={translations.operations.proposal.title}
      className="space-y-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <ProposalCardHeader status={activeProposal.status} />
      <ProposalCommercialGrid proposal={activeProposal} />
      {activeProposal.description && (
        <ProposalDescription description={activeProposal.description} />
      )}
    </section>
  );
}
