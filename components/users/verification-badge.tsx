import type { VerificationStatus } from "@/domain/users/provider";
import { translations } from "@/infrastructure/i18n/translations";

export interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const statusStyles: Record<
  VerificationStatus,
  { container: string; dot: string }
> = {
  approved: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  in_review: {
    container: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  declined: {
    container: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  not_started: {
    container: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  in_progress: {
    container: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  awaiting_user: {
    container: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  resubmitted: {
    container: "bg-cyan-50 text-cyan-700 border-cyan-200",
    dot: "bg-cyan-500",
  },
  abandoned: {
    container: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  expired: {
    container: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  kyc_expired: {
    container: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  unverified: {
    container: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

export function VerificationBadge({ status, className = "" }: VerificationBadgeProps) {
  const styles = statusStyles[status] ?? statusStyles.unverified;
  const labels = translations.users.providers.status;
  const label = labels[status as keyof typeof labels] ?? status;

  return (
    <span
      data-testid="verification-badge"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles.container} ${className}`.trim()}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${styles.dot}`} />
      <span>{label}</span>
    </span>
  );
}
