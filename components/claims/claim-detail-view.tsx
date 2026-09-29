import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { translations } from "@/infrastructure/i18n/translations";
import type { ClaimDetails, ClaimResolution, ClaimStatus, ClaimUrgency } from "@/domain/claims/claim";
import { ClaimEvidenceGallery } from "./claim-evidence-gallery";
import { OperationLinkCard } from "./operation-link-card";

export type ClaimDetailViewModel = ClaimDetails;

export interface ClaimDetailViewProps {
  claim: ClaimDetailViewModel;
  onOpenResolutionModal?: () => void;
  successMessage?: string | null;
  className?: string;
}

const statusStyles: Record<ClaimStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dismissed: "bg-slate-100 text-slate-700 border-slate-300",
};

const urgencyStyles: Record<ClaimUrgency, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

function formatDate(isoOrDate: string): string {
  try {
    const parts = isoOrDate.split("T")[0].split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return isoOrDate;
  } catch {
    return isoOrDate;
  }
}

function ClaimHeaderActions({
  claim,
  onOpenResolutionModal,
}: {
  claim: ClaimDetailViewModel;
  onOpenResolutionModal?: () => void;
}) {
  const copy = translations.claims;
  const statusLabel = copy.status[claim.status] ?? claim.status;
  const urgencyLabel = copy.urgency[claim.urgency] ?? claim.urgency;
  const canResolve = (claim.status === "open" || claim.status === "in_review") && Boolean(onOpenResolutionModal);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canResolve && (
        <button
          type="button"
          onClick={onOpenResolutionModal}
          data-testid="resolve-claim-button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#147560] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#105F4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {copy.detail.resolveButton}
        </button>
      )}
      <span
        data-testid="claim-status-badge"
        className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
          statusStyles[claim.status] ?? "bg-slate-50 text-slate-600 border-slate-200"
        }`}
      >
        {statusLabel}
      </span>
      <span
        className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
          urgencyStyles[claim.urgency] ?? "bg-slate-50 text-slate-600 border-slate-200"
        }`}
      >
        {copy.table.urgency}: {urgencyLabel}
      </span>
    </div>
  );
}

function ClaimHeader({
  claim,
  onOpenResolutionModal,
}: {
  claim: ClaimDetailViewModel;
  onOpenResolutionModal?: () => void;
}) {
  const copy = translations.claims;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={ROUTES.claims}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#147560] transition-colors hover:text-[#105F4E]"
        >
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {copy.detail.backToList}
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1A2B48]/10 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
            {copy.detail.title} — <span className="font-mono text-xl">{claim.id}</span>
          </h1>
          <p className="mt-1 text-sm text-[#536176]">{copy.detail.subtitle}</p>
        </div>

        <ClaimHeaderActions
          claim={claim}
          onOpenResolutionModal={onOpenResolutionModal}
        />
      </div>
    </div>
  );
}

function ClaimPartiesCard({ claim }: { claim: ClaimDetailViewModel }) {
  const copy = translations.claims;
  const claimantTypeLabel = copy.claimantType[claim.claimantType] ?? claim.claimantType;

  return (
    <div className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs">
      <h2 className="text-base font-semibold text-[#1A2B48]">{copy.detail.parties}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/20 p-3.5">
          <span className="text-xs font-medium text-[#536176]">{copy.detail.claimant}</span>
          <p className="mt-1 text-sm font-semibold text-[#1A2B48]">{claim.claimantName}</p>
          <span className="text-xs text-[#536176]">({claimantTypeLabel})</span>
        </div>
        <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/20 p-3.5">
          <span className="text-xs font-medium text-[#536176]">{copy.detail.respondent}</span>
          <p className="mt-1 text-sm font-semibold text-[#1A2B48]">{claim.respondentName}</p>
        </div>
        <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/20 p-3.5">
          <span className="text-xs font-medium text-[#536176]">{copy.detail.category}</span>
          <p className="mt-1 text-sm font-semibold text-[#1A2B48]">{claim.categoryName}</p>
        </div>
        <div className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/20 p-3.5">
          <span className="text-xs font-medium text-[#536176]">{copy.detail.createdAt}</span>
          <p className="mt-1 text-sm font-semibold text-[#1A2B48]">{formatDate(claim.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

function ClaimConflictSection({ claim }: { claim: ClaimDetailViewModel }) {
  const copy = translations.claims.detail;

  return (
    <section
      aria-label={copy.description}
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-2 rounded-full bg-rose-500" />
          <h2 className="text-base font-semibold text-[#1A2B48]">{claim.claimReason}</h2>
        </div>
        <div
          data-testid="claim-description"
          className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/30 p-4 text-sm leading-relaxed text-[#1A2B48] whitespace-pre-line"
        >
          {claim.description}
        </div>
      </div>
    </section>
  );
}

function ClaimResolutionCard({ resolution }: { resolution: ClaimResolution }) {
  const copy = translations.claims;
  const resCopy = copy.resolution;
  const typeKey = resolution.resolutionType as keyof typeof resCopy.types;
  const typeLabel = resCopy.types[typeKey] ?? resolution.resolutionType;

  return (
    <section
      aria-label={copy.detail.resolutionTitle}
      data-testid="claim-resolution-card"
      className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-xs"
    >
      <h2 className="text-base font-semibold text-[#1A2B48]">{copy.detail.resolutionTitle}</h2>
      <div className="mt-4 space-y-3">
        <div>
          <span className="text-xs font-medium text-[#536176]">{resCopy.typeLabel}</span>
          <p className="text-sm font-semibold text-[#1A2B48]">{typeLabel}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-[#536176]">{resCopy.reasonLabel}</span>
          <p className="mt-1 text-sm text-[#1A2B48] whitespace-pre-line rounded-lg border border-[#1A2B48]/10 bg-white p-3">
            {resolution.reason}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ClaimDetailView({
  claim,
  onOpenResolutionModal,
  successMessage,
  className = "",
}: ClaimDetailViewProps) {
  return (
    <article className={`space-y-6 ${className}`.trim()}>
      <ClaimHeader claim={claim} onOpenResolutionModal={onOpenResolutionModal} />
      {successMessage && (
        <div
          role="status"
          data-testid="claim-resolution-success"
          className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 shadow-2xs"
        >
          {successMessage}
        </div>
      )}
      {claim.resolution && <ClaimResolutionCard resolution={claim.resolution} />}
      <ClaimPartiesCard claim={claim} />
      <ClaimConflictSection claim={claim} />
      <ClaimEvidenceGallery photoUrls={claim.evidencePhotoUrls} />
      <OperationLinkCard operationId={claim.operationId} />
    </article>
  );
}
