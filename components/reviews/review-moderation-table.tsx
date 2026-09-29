import type {
  ReviewModerationItem,
  ReviewStatus,
} from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";

export type { ReviewModerationItem, ReviewStatus };

export interface ReviewModerationTableProps {
  reviews: readonly ReviewModerationItem[];
  className?: string;
  emptyMessage?: string;
  onSelectReview?: (review: ReviewModerationItem) => void;
}

const statusStyles: Record<ReviewStatus, string> = {
  reported: "bg-amber-50 text-amber-700 border-amber-200",
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
    <thead className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
      <tr>
        <th scope="col" className="px-6 py-4 text-left">{copy.author}</th>
        <th scope="col" className="px-6 py-4 text-left">{copy.provider}</th>
        <th scope="col" className="px-6 py-4 text-left">{copy.rating}</th>
        <th scope="col" className="px-6 py-4 text-left">{copy.comment}</th>
        <th scope="col" className="px-6 py-4 text-left">{copy.reportReason}</th>
        <th scope="col" className="px-6 py-4 text-left">{copy.status}</th>
        <th scope="col" className="px-6 py-4 text-left">{copy.date}</th>
      </tr>
    </thead>
  );
}

interface ReviewModerationTableRowProps {
  review: ReviewModerationItem;
  onSelectReview?: (review: ReviewModerationItem) => void;
}

function ReviewModerationTableRow({ review, onSelectReview }: ReviewModerationTableRowProps) {
  const copy = translations.moderation.table;
  const reportReasonText = review.reportReason || copy.noReason;

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
      className={`transition-colors hover:bg-[#F4F1EE]/30 ${
        onSelectReview ? "cursor-pointer focus:bg-[#F4F1EE]/50 focus:outline-none focus:ring-1 focus:ring-[#147560]" : ""
      }`.trim()}
    >
      <td className="px-6 py-4 font-medium text-sm text-[#1A2B48]">
        {review.authorName}
      </td>
      <td className="px-6 py-4 text-sm text-[#536176]">
        {review.providerName}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center gap-1.5" aria-label={`Calificación: ${review.rating} de 5`}>
          <StarIcon />
          <span className="font-semibold text-[#1A2B48]">{review.rating}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-[#536176] max-w-xs break-words">
        {review.comment}
      </td>
      <td className="px-6 py-4 text-sm text-[#536176] max-w-xs break-words">
        {reportReasonText}
      </td>
      <td className="px-6 py-4 text-sm">
        <ReviewStatusBadge status={review.status} />
      </td>
      <td className="px-6 py-4 text-sm text-[#536176] whitespace-nowrap">
        {formatDate(review.createdAt)}
      </td>
    </tr>
  );
}

export function ReviewModerationTable({
  reviews,
  className = "",
  emptyMessage,
  onSelectReview,
}: ReviewModerationTableProps) {
  const copy = translations.moderation.table;

  if (reviews.length === 0) {
    return (
      <div className={`rounded-2xl border border-[#1A2B48]/10 bg-white p-12 text-center ${className}`.trim()}>
        <p className="text-sm font-medium text-[#536176]">
          {emptyMessage || copy.empty}
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs ${className}`.trim()}>
      <div className="overflow-x-auto">
        <table
          aria-label={copy.ariaLabel}
          className="w-full border-collapse text-left"
        >
          <ReviewModerationTableHeader />
          <tbody className="divide-y divide-[#1A2B48]/5">
            {reviews.map((review) => (
              <ReviewModerationTableRow
                key={review.id}
                review={review}
                onSelectReview={onSelectReview}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
