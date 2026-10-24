"use client";

import { useEffect, useRef, useState } from "react";
import { translations } from "@/infrastructure/i18n/translations";
import { Modal } from "./modal";

interface SelectedPhoto {
  readonly url: string;
  readonly altText: string;
}

export interface EvidencePhotoGalleryProps {
  readonly photos: readonly string[];
  readonly photoAlt: string;
  readonly className?: string;
  readonly thumbnailClassName?: string;
}

export function EvidencePhotoGallery({
  photos,
  photoAlt,
  className = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",
  thumbnailClassName = "aspect-square",
}: EvidencePhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const copy = translations.images;

  useEffect(() => {
    if (selectedPhoto !== null) return;

    const trigger = returnFocusRef.current;
    if (trigger?.isConnected) trigger.focus();
  }, [selectedPhoto]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className={className}>
        {photos.map((url, index) => {
          const altText = `${photoAlt} ${index + 1}`;

          return (
            <button
              key={`${url}-${index}`}
              type="button"
              aria-label={`${copy.openPhoto} ${altText}`}
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setSelectedPhoto({ url, altText });
              }}
              className={`group relative overflow-hidden rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560] ${thumbnailClassName}`.trim()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={altText}
                className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>

      <Modal
        isOpen={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        title={copy.dialogTitle}
        closeAriaLabel={copy.closeAriaLabel}
        className="!max-w-5xl"
      >
        {selectedPhoto && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.altText}
              className="max-h-[calc(100dvh-12rem)] max-w-full object-contain"
            />
          </div>
        )}
      </Modal>
    </>
  );
}
