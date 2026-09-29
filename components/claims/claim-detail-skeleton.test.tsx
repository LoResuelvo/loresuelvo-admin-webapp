import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { translations } from "@/infrastructure/i18n/translations";
import { ClaimDetailSkeleton } from "./claim-detail-skeleton";

describe("ClaimDetailSkeleton", () => {
  it("renders with role status, aria-busy, and accessible loading label", () => {
    render(<ClaimDetailSkeleton />);

    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveAttribute("aria-label", translations.claims.detail.loading);
    expect(screen.getByTestId("claim-detail-skeleton")).toBeInTheDocument();
  });

  it("renders multiple visual skeleton indicators for dossier sections", () => {
    render(<ClaimDetailSkeleton />);

    const indicators = screen.getAllByTestId("skeleton-indicator");
    expect(indicators.length).toBeGreaterThanOrEqual(3);
  });
});
