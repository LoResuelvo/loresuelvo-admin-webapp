import { translations } from "@/infrastructure/i18n/translations";

export type ClaimantType = "consumer" | "provider";
export type ClaimStatus = "open" | "in_review" | "resolved" | "dismissed";
export type ClaimUrgency = "high" | "medium" | "low";

export interface ClaimItem {
  id: string;
  createdAt: string;
  operationId: number;
  claimantType: ClaimantType;
  claimantName: string;
  respondentName: string;
  categoryName: string;
  status: ClaimStatus;
  urgency: ClaimUrgency;
}

export interface ClaimsTableProps {
  claims: readonly ClaimItem[];
  onSelectClaim?: (claim: ClaimItem) => void;
  className?: string;
  emptyMessage?: string;
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

function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const copy = translations.claims.status;
  const label = copy[status] ?? status;
  const style = statusStyles[status] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function ClaimUrgencyBadge({ urgency }: { urgency: ClaimUrgency }) {
  const copy = translations.claims.urgency;
  const label = copy[urgency] ?? urgency;
  const style = urgencyStyles[urgency] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function ClaimsTableHeader() {
  const copy = translations.claims.table;
  return (
    <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
      <tr>
        <th scope="col" className="px-6 py-4">{copy.date}</th>
        <th scope="col" className="px-6 py-4">{copy.claimant}</th>
        <th scope="col" className="px-6 py-4">{copy.respondent}</th>
        <th scope="col" className="px-6 py-4">{copy.category}</th>
        <th scope="col" className="px-6 py-4">{copy.status}</th>
        <th scope="col" className="px-6 py-4">{copy.urgency}</th>
      </tr>
    </thead>
  );
}

interface ClaimsTableRowProps {
  claim: ClaimItem;
  onSelectClaim?: (claim: ClaimItem) => void;
}

function ClaimsTableRow({ claim, onSelectClaim }: ClaimsTableRowProps) {
  const copy = translations.claims;
  return (
    <tr
      onClick={() => onSelectClaim?.(claim)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectClaim?.(claim);
        }
      }}
      tabIndex={onSelectClaim ? 0 : undefined}
      className={`transition-colors hover:bg-[#F4F1EE]/30 ${
        onSelectClaim ? "cursor-pointer focus:bg-[#F4F1EE]/50 focus:outline-none focus:ring-1 focus:ring-[#147560]" : ""
      }`.trim()}
    >
      <td className="px-6 py-4 whitespace-nowrap text-[#536176] font-mono text-xs">
        {formatDate(claim.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-[#1A2B48]">{claim.claimantName}</div>
        <div className="text-xs text-[#536176]">
          {copy.claimantType[claim.claimantType] ?? claim.claimantType}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-[#1A2B48]">{claim.respondentName}</div>
      </td>
      <td className="px-6 py-4 font-medium text-[#1A2B48] whitespace-nowrap">
        {claim.categoryName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ClaimStatusBadge status={claim.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ClaimUrgencyBadge urgency={claim.urgency} />
      </td>
    </tr>
  );
}

export function ClaimsTable({
  claims,
  onSelectClaim,
  className = "",
  emptyMessage,
}: ClaimsTableProps) {
  const copy = translations.claims;
  const emptyText = emptyMessage ?? copy.table.empty;

  return (
    <div className={`overflow-x-auto rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs ${className}`.trim()}>
      <table aria-label={copy.table.ariaLabel} className="w-full text-left text-sm text-[#1A2B48]">
        <ClaimsTableHeader />
        <tbody className="divide-y divide-[#1A2B48]/5">
          {claims.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#536176]">
                {emptyText}
              </td>
            </tr>
          ) : (
            claims.map((claim) => (
              <ClaimsTableRow
                key={claim.id}
                claim={claim}
                onSelectClaim={onSelectClaim}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
