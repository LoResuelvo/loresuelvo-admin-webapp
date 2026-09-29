import { translations } from "@/infrastructure/i18n/translations";

export interface ClaimEvidenceGalleryProps {
  photoUrls: readonly string[];
  className?: string;
}

export function ClaimEvidenceGallery({
  photoUrls,
  className = "",
}: ClaimEvidenceGalleryProps) {
  const copy = translations.claims.detail;

  return (
    <section
      aria-label={copy.evidenceTitle}
      data-testid="claim-evidence-gallery"
      className={`rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs ${className}`.trim()}
    >
      <div className="flex items-center justify-between border-b border-[#1A2B48]/10 pb-4">
        <h2 className="text-base font-semibold text-[#1A2B48]">
          {copy.evidenceTitle}
        </h2>
        <span className="text-xs font-medium text-[#536176]">
          {photoUrls.length} {photoUrls.length === 1 ? "foto" : "fotos"}
        </span>
      </div>

      {photoUrls.length === 0 ? (
        <p className="mt-4 text-sm text-[#536176]">{copy.evidenceEmpty}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {photoUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-4/3 overflow-hidden rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/30"
            >
              <img
                src={url}
                alt={`${copy.evidencePhotoAlt} ${index + 1}`}
                className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
