import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EvidencePhotoGallery } from "./evidence-photo-gallery";

describe("EvidencePhotoGallery", () => {
  it("opens the full photo and returns keyboard focus to its trigger after Escape", async () => {
    render(
      <EvidencePhotoGallery
        photos={["https://example.com/evidence.jpg"]}
        photoAlt="Foto de evidencia adjunta al reclamo"
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Ampliar Foto de evidencia adjunta al reclamo 1",
    });
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", {
      name: "Vista ampliada de la fotografía",
    });
    expect(
      within(dialog).getByRole("img", {
        name: "Foto de evidencia adjunta al reclamo 1",
      }),
    ).toHaveAttribute("src", "https://example.com/evidence.jpg");

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});
