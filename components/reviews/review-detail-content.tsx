import Link from "next/link";
import type { ReviewModerationDetail } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

interface ReviewDetailContentProps {
  review: ReviewModerationDetail;
}

function formatDate(value: string): string {
  const date = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function translateCategory(category: string): string {
  const labels = translations.moderation.infractions;
  const match = Object.entries(labels).find(([key]) => key === category);
  return match?.[1] ?? category;
}

function translateDecision(action: string): string {
  const labels = translations.moderation.decisionActions;
  if (action === "hide") return labels.hide;
  if (action === "unhide") return labels.unhide;
  return action;
}

function translateReportStatus(status: string): string {
  if (status === "pending") return translations.moderation.reportStatuses.pending;
  return status;
}

function ReviewSummary({ review }: { review: ReviewModerationDetail }) {
  const copy = translations.moderation.modal;
  const item = review.review;

  return (
    <section aria-label={copy.reviewSummary}>
      <dl className="grid gap-x-4 gap-y-2 rounded-xl bg-[#F4F1EE]/60 p-3 text-xs text-[#536176] sm:grid-cols-2">
        <div>
          <dt className="inline font-semibold text-[#1A2B48]">{copy.reviewId}: </dt>
          <dd className="inline">{item.id}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[#1A2B48]">{copy.consumer}: </dt>
          <dd className="inline">
            <Link className="text-[#147560] underline underline-offset-2" href={ROUTES.consumerDetail(item.consumerId)}>
              {item.consumerName ?? item.consumerId}
            </Link>
          <span className="ml-2 text-[#536176]">{copy.consumerId}: {item.consumerId}</span>
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[#1A2B48]">{copy.provider}: </dt>
          <dd className="inline">
            <Link className="text-[#147560] underline underline-offset-2" href={ROUTES.providerDetail(item.providerId)}>
              {item.providerName ?? item.providerId}
            </Link>
          <span className="ml-2 text-[#536176]">{copy.providerId}: {item.providerId}</span>
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[#1A2B48]">{copy.operationId}: </dt>
          <dd className="inline"><Link className="text-[#147560] underline underline-offset-2" href={ROUTES.operationDetail(item.operationId)}>{item.operationId}</Link></dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[#1A2B48]">{copy.rating}: </dt>
          <dd className="inline">{item.rating} / 5</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[#1A2B48]">{copy.visibility}: </dt>
          <dd className="inline">{translations.moderation.status[item.visibility]}</dd>
        </div>
      </dl>
      <section className="mt-4 space-y-1" aria-label={copy.description}>
        <h3 className="text-sm font-semibold text-[#1A2B48]">{copy.description}</h3>
        <p className="whitespace-pre-wrap rounded-xl border border-[#1A2B48]/10 p-3 text-sm text-[#536176]">{review.description}</p>
      </section>
    </section>
  );
}

function ReviewReport({ review }: { review: ReviewModerationDetail }) {
  const copy = translations.moderation.modal;
  if (!review.report) return null;

  return (
    <section className="mt-4 space-y-1 rounded-xl border border-[#1A2B48]/10 p-3" aria-label={copy.report}>
      <h3 className="text-sm font-semibold text-[#1A2B48]">{copy.report}</h3>
      <dl className="space-y-1 text-xs text-[#536176]">
        <div><dt className="inline font-semibold text-[#1A2B48]">{copy.reportId}: </dt><dd className="inline">{review.report.id}</dd></div>
        <div><dt className="inline font-semibold text-[#1A2B48]">{copy.reportCategory}: </dt><dd className="inline">{translateCategory(review.report.category)}</dd></div>
        <div><dt className="inline font-semibold text-[#1A2B48]">{copy.reportStatus}: </dt><dd className="inline">{translateReportStatus(review.report.status)}</dd></div>
        <div><dt className="inline font-semibold text-[#1A2B48]">{copy.reportDate}: </dt><dd className="inline">{formatDate(review.report.createdOn)}</dd></div>
      </dl>
      <p className="pt-1 text-sm text-[#536176]">{review.report.explanation}</p>
    </section>
  );
}

function ReviewDecisionHistory({ review }: { review: ReviewModerationDetail }) {
  const copy = translations.moderation.modal;
  const decisions = review.decisions.items;

  return (
    <section className="mt-4 space-y-2" aria-labelledby="review-moderation-history-title">
      <h3 id="review-moderation-history-title" className="text-sm font-semibold text-[#1A2B48]">{copy.history}</h3>
      {decisions.length === 0 ? (
        <p className="text-xs text-[#536176]">{copy.noHistory}</p>
      ) : (
        <ul aria-label={copy.history} className="space-y-3">
          {decisions.map((decision) => (
            <li key={decision.id} className="rounded-xl border border-[#1A2B48]/10 p-3 text-xs text-[#536176]">
              <p className="font-semibold text-[#1A2B48]">{translateDecision(decision.action)} · {formatDate(decision.createdOn)}</p>
              <p><strong className="text-[#1A2B48]">{copy.operatorId}:</strong> {decision.operatorId}</p>
              {decision.category && (
                <p><strong className="text-[#1A2B48]">{copy.categoryLabel}:</strong> {translateCategory(decision.category)}</p>
              )}
              <p><strong className="text-[#1A2B48]">{copy.reasonLabel}:</strong> {decision.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReviewDetailContent({ review }: ReviewDetailContentProps) {
  return (
    <div className="space-y-1">
      <ReviewSummary review={review} />
      <ReviewReport review={review} />
      <ReviewDecisionHistory review={review} />
    </div>
  );
}
