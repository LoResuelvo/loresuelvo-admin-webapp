import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClaimEvidenceGallery } from "./claim-evidence-gallery";

describe("ClaimEvidenceGallery", () => {
  it("renders gallery with images and accessible alt texts", () => {
    const urls = [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg",
    ];
    render(<ClaimEvidenceGallery photoUrls={urls} />);

    expect(screen.getByRole("region", { name: "Evidencias fotográficas" })).toBeInTheDocument();
    expect(screen.getByText("2 fotos")).toBeInTheDocument();

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "https://example.com/photo1.jpg");
    expect(images[0]).toHaveAttribute("alt", "Foto de evidencia adjunta al reclamo 1");
    expect(images[1]).toHaveAttribute("src", "https://example.com/photo2.jpg");
    expect(images[1]).toHaveAttribute("alt", "Foto de evidencia adjunta al reclamo 2");
  });

  it("renders empty message when no photos are provided", () => {
    render(<ClaimEvidenceGallery photoUrls={[]} />);

    expect(screen.getByText("No se adjuntaron fotografías de evidencia.")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
