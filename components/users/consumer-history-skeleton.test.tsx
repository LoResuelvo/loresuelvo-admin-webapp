import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerHistorySkeleton } from "./consumer-history-skeleton";

describe("ConsumerHistorySkeleton", () => {
  it("renders with role status, aria-busy true and accessible label", () => {
    render(<ConsumerHistorySkeleton />);

    const skeleton = screen.getByTestId("consumer-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("role", "status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");

    const expectedLabel =
      translations.users.consumerDetail.skeletonLoading ??
      translations.users.consumerDetail.loading;
    expect(skeleton).toHaveAttribute("aria-label", expectedLabel);
  });

  it("renders multiple visual skeleton indicators for profile and history", () => {
    render(<ConsumerHistorySkeleton />);

    const indicators = screen.getAllByTestId("skeleton-indicator");
    expect(indicators.length).toBeGreaterThanOrEqual(2);
  });

  it("applies custom className when provided", () => {
    render(<ConsumerHistorySkeleton className="custom-consumer-skeleton-class" />);

    const skeleton = screen.getByTestId("consumer-skeleton");
    expect(skeleton).toHaveClass("custom-consumer-skeleton-class");
  });
});
