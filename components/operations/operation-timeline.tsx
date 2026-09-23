import type { TimelineMilestone } from "@/domain/operations/unified-operation-detail";

export interface OperationTimelineProps {
  readonly milestones: readonly TimelineMilestone[];
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return timestamp;
  }
}

function TimelineItem({
  milestone,
  index,
  isLast,
}: {
  milestone: TimelineMilestone;
  index: number;
  isLast: boolean;
}) {
  const formattedDate = formatTimestamp(milestone.timestamp);

  return (
    <li
      data-testid="timeline-milestone"
      className="relative flex items-start gap-4 pb-6 last:pb-0"
    >
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-4 top-8 -bottom-1 w-0.5 bg-[#1A2B48]/15"
        />
      )}
      <div
        data-testid="milestone-step"
        className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#147560] text-xs font-bold text-white shadow-xs"
      >
        {index + 1}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm font-semibold text-[#1A2B48]">{milestone.title}</p>
        <time
          dateTime={milestone.timestamp}
          className="mt-0.5 block text-xs font-medium text-[#536176]"
        >
          {formattedDate}
        </time>
      </div>
    </li>
  );
}

export function OperationTimeline({ milestones }: OperationTimelineProps) {
  return (
    <section
      data-testid="operation-timeline"
      aria-label="Línea de tiempo del recorrido del servicio"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <header className="border-b border-[#1A2B48]/10 pb-4">
        <h2 className="text-base font-semibold text-[#1A2B48]">
          Línea de tiempo del servicio
        </h2>
        <p className="mt-0.5 text-xs text-[#536176]">
          Historial cronológico de eventos y avance de la contratación
        </p>
      </header>

      <div className="mt-6">
        {milestones.length === 0 ? (
          <p className="text-sm text-[#536176]">
            No hay eventos registrados en la línea de tiempo.
          </p>
        ) : (
          <ol className="relative">
            {milestones.map((milestone, idx) => (
              <TimelineItem
                key={`${milestone.type}-${milestone.timestamp}-${idx}`}
                milestone={milestone}
                index={idx}
                isLast={idx === milestones.length - 1}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
