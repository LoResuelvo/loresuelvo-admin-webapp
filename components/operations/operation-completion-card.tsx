import type {
  CompletionReport,
  ServiceReview,
} from "@/domain/operations/unified-operation-detail";
import { translations } from "@/infrastructure/i18n/translations";
import { EvidencePhotoGallery } from "@/components/ui/evidence-photo-gallery";

export interface OperationCompletionCardProps {
  readonly completionReport?: CompletionReport | null;
  readonly review?: ServiceReview | null;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

function StarRating({ rating }: { rating: number }) {
  const clampedRating = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Calificación: ${clampedRating} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={`text-base ${
            star <= clampedRating ? "text-amber-400" : "text-slate-200"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1.5 text-xs font-bold text-[#1A2B48]">
        {clampedRating}/5
      </span>
    </div>
  );
}

function EvidencePhotosGallery({ photos }: { photos: readonly string[] }) {
  const copy = translations.operations.completion;
  if (photos.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-[#536176]">
        {copy.evidencePhotos} ({photos.length})
      </h4>
      <EvidencePhotoGallery
        photos={photos}
        photoAlt={translations.images.completionPhotoAlt}
      />
    </div>
  );
}

function CompletionReportSection({ report }: { report: CompletionReport }) {
  const copy = translations.operations.completion;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#147560]">
          {copy.title}
        </h3>
        {report.completedAt && (
          <span className="text-xs text-[#536176]">
            {copy.completedAt}: {formatDate(report.completedAt)}
          </span>
        )}
      </div>

      {report.notes && (
        <div className="border-l border-[#dce1e5] pl-4">
          <h4 className="text-xs font-medium text-[#536176]">
            {copy.notes}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-[#1A2B48]">{report.notes}</p>
        </div>
      )}

      <EvidencePhotosGallery photos={report.photos} />
    </div>
  );
}

function CustomerReviewSection({ review }: { review: ServiceReview }) {
  const copy = translations.operations.review;

  return (
    <div
      data-testid="operation-review-card"
      aria-label={copy.title}
      className="space-y-3 rounded-xl border border-amber-200/60 bg-amber-50/40 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/50 pb-2.5">
        <div>
          <h3 className="text-sm font-semibold text-[#1A2B48]">{copy.title}</h3>
          <p className="text-xs text-[#536176]">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} />
        </div>
      </div>

      {review.comment && (
        <p className="text-sm leading-relaxed text-[#1A2B48]">{review.comment}</p>
      )}

      {review.createdAt && (
        <p className="text-right text-xs text-[#536176]">
          {formatDate(review.createdAt)}
        </p>
      )}
    </div>
  );
}

export function OperationCompletionCard({
  completionReport,
  review,
}: OperationCompletionCardProps) {
  if (!completionReport && !review) {
    return null;
  }

  return (
    <section
      data-testid="operation-completion-card"
      aria-label="Finalización del servicio y reseña"
      className="space-y-5 admin-detail-section"
    >
      <header className="border-b border-[#1A2B48]/10 pb-4">
        <h2 className="text-base font-semibold text-[#1A2B48]">
          Cierre y conformidad del servicio
        </h2>
        <p className="mt-0.5 text-xs text-[#536176]">
          Informe del trabajo realizado, evidencias y valoración del cliente
        </p>
      </header>

      {completionReport && <CompletionReportSection report={completionReport} />}

      {review && <CustomerReviewSection review={review} />}
    </section>
  );
}
