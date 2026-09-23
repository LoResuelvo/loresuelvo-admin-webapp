import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { translations } from "@/infrastructure/i18n/translations";
import { OperationDetailSkeleton } from "./operation-detail-skeleton";

describe("OperationDetailSkeleton", () => {
  it("renders with role status, aria-busy, and accessible loading label", () => {
    render(<OperationDetailSkeleton />);

    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveAttribute("aria-label", translations.operations.loading);
    expect(screen.getByTestId("operation-detail-skeleton")).toBeInTheDocument();
  });

  it("renders multiple visual skeleton indicators for header, cards, and timeline", () => {
    render(<OperationDetailSkeleton />);

    const indicators = screen.getAllByTestId("skeleton-indicator");
    expect(indicators.length).toBeGreaterThanOrEqual(3);
  });
});
