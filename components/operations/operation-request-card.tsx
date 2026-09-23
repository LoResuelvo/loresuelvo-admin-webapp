import type { RequestDetail } from "@/domain/operations/unified-operation-detail";

export interface OperationRequestCardProps {
  readonly request: RequestDetail;
}

function AiDiagnosticBanner({
  summary,
  assessmentId,
}: {
  summary?: string | null;
  assessmentId?: string | null;
}) {
  return (
    <div className="rounded-xl border border-[#147560]/20 bg-[#147560]/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="size-5 shrink-0 text-[#147560]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider text-[#147560]">
            Diagnóstico Asistido por IA (Asistente Virtual)
          </span>
        </div>
        {assessmentId && (
          <span className="font-mono text-xs font-semibold text-[#536176]">
            Ref: {assessmentId}
          </span>
        )}
      </div>
      {summary && (
        <p className="mt-2 text-sm font-medium text-[#1A2B48]">{summary}</p>
      )}
    </div>
  );
}

function PhotoGallery({ photos }: { photos: readonly string[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#536176]">
        Fotos adjuntas ({photos.length})
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photoUrl, idx) => (
          <div
            key={`${photoUrl}-${idx}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-testid="request-photo"
              src={photoUrl}
              alt={`Foto adjunta ${idx + 1}`}
              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OperationRequestCard({ request }: OperationRequestCardProps) {
  const hasAi = Boolean(request.diagnosticSummary || request.sourceAssessmentId);

  return (
    <section
      data-testid="operation-request-card"
      aria-label="Solicitud inicial del cliente"
      className="space-y-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <header className="border-b border-[#1A2B48]/10 pb-4">
        <h2 className="text-base font-semibold text-[#1A2B48]">
          Solicitud inicial del cliente
        </h2>
        <p className="mt-0.5 text-xs text-[#536176]">
          Detalle del problema reportado y evidencias visuales
        </p>
      </header>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#1A2B48]">{request.title}</h3>
        <p className="text-sm leading-relaxed text-[#536176]">{request.description}</p>
      </div>

      {hasAi && (
        <AiDiagnosticBanner
          summary={request.diagnosticSummary}
          assessmentId={request.sourceAssessmentId}
        />
      )}

      <PhotoGallery photos={request.photos} />
    </section>
  );
}
