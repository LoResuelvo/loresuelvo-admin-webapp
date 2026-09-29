import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModerationSkeleton } from "./moderation-skeleton";
import { translations } from "@/infrastructure/i18n/translations";

describe("ModerationSkeleton", () => {
  it("renders with status role, aria-busy and accessible loading label", () => {
    render(<ModerationSkeleton />);

    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveAttribute("aria-label", translations.moderation.loadingComments);
    expect(screen.getByTestId("moderation-skeleton")).toBeInTheDocument();
  });

  it("renders tab and table placeholder indicators with pulse animation", () => {
    const { container } = render(<ModerationSkeleton />);

    expect(screen.getByTestId("moderation-skeleton-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("moderation-skeleton-table")).toBeInTheDocument();

    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("applies optional custom className", () => {
    render(<ModerationSkeleton className="custom-class" />);

    expect(screen.getByTestId("moderation-skeleton")).toHaveClass("custom-class");
  });
});
