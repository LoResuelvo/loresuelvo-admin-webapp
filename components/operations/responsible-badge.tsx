import { translations } from "@/infrastructure/i18n/translations";
import type { ActionResponsible } from "@/domain/operations/operation-summary";

export type { ActionResponsible };

export interface ResponsibleBadgeProps {
  responsible: ActionResponsible | null;
  className?: string;
}

const responsibleConfig: Record<
  ActionResponsible,
  { label: string; container: string }
> = {
  consumer: {
    label: "Cliente",
    container: "bg-sky-50 text-sky-700 border-sky-200",
  },
  provider: {
    label: "Prestador",
    container: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  platform: {
    label: "Plataforma",
    container: "bg-violet-50 text-violet-700 border-violet-200",
  },
  none: {
    label: "—",
    container: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

export function ResponsibleBadge({ responsible, className = "" }: ResponsibleBadgeProps) {
  const config = (responsible ? responsibleConfig[responsible] : undefined) ?? responsibleConfig.none;

  return (
    <span
      data-testid="responsible-badge"
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${config.container} ${className}`.trim()}
    >
      {responsible === null ? translations.operations.unavailable : config.label}
    </span>
  );
}
