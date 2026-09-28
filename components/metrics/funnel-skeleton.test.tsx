import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunnelSkeleton } from "./funnel-skeleton";
import { translations } from "@/infrastructure/i18n/translations";

describe("FunnelSkeleton", () => {
  it("renders accessible loading status with indicators and pulse animation", () => {
    render(<FunnelSkeleton />);

    const statusElement = screen.getByRole("status");
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute("aria-busy", "true");
    expect(statusElement).toHaveAttribute(
      "aria-label",
      translations.metrics.loading,
    );

    const indicators = screen.getAllByTestId("skeleton-indicator");
    expect(indicators.length).toBeGreaterThan(0);
    expect(screen.getByText(translations.metrics.loading)).toBeInTheDocument();
  });
});
