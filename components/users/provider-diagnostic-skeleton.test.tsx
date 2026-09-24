import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { translations } from "@/infrastructure/i18n/translations";
import { ProviderDiagnosticSkeleton } from "./provider-diagnostic-skeleton";

describe("ProviderDiagnosticSkeleton", () => {
  it("renders with role status, aria-busy true and accessible label", () => {
    render(<ProviderDiagnosticSkeleton />);

    const skeleton = screen.getByTestId("diagnostic-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("role", "status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");

    const expectedLabel =
      translations.users.diagnostic.skeletonLoading ??
      translations.users.diagnostic.loading;
    expect(skeleton).toHaveAttribute("aria-label", expectedLabel);
  });

  it("renders multiple visual skeleton indicators", () => {
    render(<ProviderDiagnosticSkeleton />);

    const indicators = screen.getAllByTestId("skeleton-indicator");
    expect(indicators.length).toBeGreaterThanOrEqual(3);
  });

  it("applies custom className when provided", () => {
    render(<ProviderDiagnosticSkeleton className="custom-test-class" />);

    const skeleton = screen.getByTestId("diagnostic-skeleton");
    expect(skeleton).toHaveClass("custom-test-class");
  });
});
