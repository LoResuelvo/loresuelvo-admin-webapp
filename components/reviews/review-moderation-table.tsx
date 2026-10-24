import Link from "next/link";
import type {
  ReviewModerationItem,
  ReviewStatus,
} from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

export type { ReviewModerationItem, ReviewStatus };

export interface ReviewModerationTableProps {
  reviews: readonly ReviewModerationItem[];
  className?: string;
  emptyMessage?: string;
  onSelectReview?: (review: ReviewModerationItem) => void;
  onViewReview?: (review: ReviewModerationItem) => void;
  onHideReview?: (review: ReviewModerationItem) => void;
  onRestoreReview?: (review: ReviewModerationItem) => void;
}

const statusStyles: Record<ReviewStatus, string> = {
  hidden: "bg-rose-50 text-rose-700 border-rose-200",
  visible: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

function StarIcon() {
  return (
    <svg aria-hidden="true" className="size-4 text-amber-500 fill-amber-400" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const copy = translations.moderation.status;
  const label = copy[status] ?? status;
  const style = statusStyles[status] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function ReviewModerationTableHeader() {
  const copy = translations.moderation.table;
  return (
    <thead className="admin-table-heading">
      <tr>
        <th scope="col" className="px-3 py-3 text-left">{copy.participants}</th>
        <th scope="col" className="px-3 py-3 text-left">{copy.rating}</th>
        <th scope="col" className="px-3 py-3 text-left">{copy.pendingReports}</th>
        <th scope="col" className="px-3 py-3 text-left">{copy.status}</th>
        <th scope="col" className="px-3 py-3 text-left">{copy.actions}</th>
      </tr>
    </thead>
  );
}

interface ReviewProfileLinkProps {
  role: string;
  name?: string;
  id: number;
  href: string;
}

function ReviewProfileLink({ role, name, id, href }: ReviewProfileLinkProps) {
  const copy = translations.moderation.table;

  return (
    <div className="min-w-0">
      <span className="block text-[11px] font-medium text-[#536176]">{role}</span>
      <Link
        href={href}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        className="block truncate font-medium text-[#147560] underline underline-offset-2"
      >
        {name ?? `${role} #${id}`}
      </Link>
    </div>
  );
}

interface ReviewActionButtonsProps {
  review: ReviewModerationItem;
  onView?: (review: ReviewModerationItem) => void;
  onHide?: (review: ReviewModerationItem) => void;
  onRestore?: (review: ReviewModerationItem) => void;
}

function ReviewActionButtons({ review, onView, onHide, onRestore }: ReviewActionButtonsProps) {
  const actions = translations.moderation.actions;
  const moderationAction = review.visibility === "hidden" ? (
    <button
      type="button"
      onKeyDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onRestore?.(review);
      }}
      className="inline-flex items-center rounded-lg border border-[#147560]/30 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#147560] transition-colors hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
    >
      {actions.restore}
    </button>
  ) : (
    <button
      type="button"
      onKeyDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onHide?.(review);
      }}
      className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
    >
      {actions.hide}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onKeyDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onView?.(review);
        }}
        className="rounded-lg border border-[#1A2B48]/20 px-2.5 py-1 text-xs font-semibold text-[#1A2B48] hover:bg-[#F4F1EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
      >
        {actions.viewDetails}
      </button>
      {moderationAction}
    </div>
  );
}

interface ReviewModerationTableRowProps {
  review: ReviewModerationItem;
  onSelectReview?: (review: ReviewModerationItem) => void;
  onViewReview?: (review: ReviewModerationItem) => void;
  onHideReview?: (review: ReviewModerationItem) => void;
  onRestoreReview?: (review: ReviewModerationItem) => void;
}

function ReviewModerationTableRow({
  review,
  onSelectReview,
  onViewReview,
  onHideReview,
  onRestoreReview,
}: ReviewModerationTableRowProps) {
  const copy = translations.moderation.table;
  const reportedOn = review.reportedOn ? formatDate(review.reportedOn) : "—";
  const reportCountLabel = review.pendingReportCount === 1
    ? copy.pendingReportSingular
    : copy.pendingReportPlural;

  return (
    <tr
      onClick={() => onSelectReview?.(review)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectReview?.(review);
        }
      }}
      tabIndex={onSelectReview ? 0 : undefined}
      className={`transition-colors hover:bg-[#f8f9fa] ${
        onSelectReview ? "cursor-pointer focus:bg-[#F4F1EE]/50 focus:outline-none focus:ring-1 focus:ring-[#147560]" : ""
      }`.trim()}
    >
      <td className="space-y-2 px-3 py-3 text-sm text-[#1A2B48]">
        <ReviewProfileLink
          role={copy.author}
          name={review.consumerName}
          id={review.consumerId}
          href={ROUTES.consumerDetail(review.consumerId)}
        />
        <ReviewProfileLink
          role={copy.provider}
          name={review.providerName}
          id={review.providerId}
          href={ROUTES.providerDetail(review.providerId)}
        />
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center gap-1.5" aria-label={`Calificación: ${review.rating} de 5`}>
          <StarIcon />
          <span className="font-semibold text-[#1A2B48]">{review.rating}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="space-y-1">
          {review.pendingReportCount > 0 ? (
            <span
              aria-label={`${review.pendingReportCount} ${reportCountLabel}`}
              className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900"
            >
              {review.pendingReportCount} {reportCountLabel}
            </span>
          ) : (
            <span className="text-xs text-[#536176]">{copy.noReason}</span>
          )}
          {reportedOn !== "—" && (
            <p className="text-xs text-[#536176]">
              {copy.reportedOn} <time dateTime={review.reportedOn ?? undefined}>{reportedOn}</time>
            </p>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <ReviewStatusBadge status={review.visibility} />
      </td>
      <td className="px-3 py-3 text-sm">
        <ReviewActionButtons review={review} onView={onViewReview} onHide={onHideReview} onRestore={onRestoreReview} />
      </td>
    </tr>
  );
}

export function ReviewModerationTable({
  reviews,
  className = "",
  emptyMessage,
  onSelectReview,
  onViewReview,
  onHideReview,
  onRestoreReview,
}: ReviewModerationTableProps) {
  const copy = translations.moderation.table;

  if (reviews.length === 0) {
    return (
      <div className={`rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center ${className}`.trim()}>
        <p className="text-sm font-medium text-[#536176]">{emptyMessage || copy.empty}</p>
      </div>
    );
  }

  return (
    <div className={`admin-table-frame ${className}`.trim()}>
      <div className="overflow-x-auto">
        <table aria-label={copy.ariaLabel} className="w-full min-w-[680px] table-fixed border-collapse text-left">
          <ReviewModerationTableHeader />
          <tbody className="divide-y divide-[#e8ebee]">
            {reviews.map((review) => (
              <ReviewModerationTableRow
                key={review.id}
                review={review}
                onSelectReview={onSelectReview}
                onViewReview={onViewReview}
                onHideReview={onHideReview}
                onRestoreReview={onRestoreReview}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
