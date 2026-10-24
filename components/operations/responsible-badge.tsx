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
    container: "text-[#536176]",
  },
  provider: {
    label: "Prestador",
    container: "text-[#536176]",
  },
  platform: {
    label: "Plataforma",
    container: "text-[#536176]",
  },
  none: {
    label: "—",
    container: "text-[#536176]",
  },
};

export function ResponsibleBadge({ responsible, className = "" }: ResponsibleBadgeProps) {
  const config = (responsible ? responsibleConfig[responsible] : undefined) ?? responsibleConfig.none;

  return (
    <span
      data-testid="responsible-badge"
      className={`inline-flex items-center text-xs font-medium ${config.container} ${className}`.trim()}
    >
      {responsible === null ? translations.operations.unavailable : config.label}
    </span>
  );
}
