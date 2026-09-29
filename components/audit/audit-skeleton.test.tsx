import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuditSkeleton } from "./audit-skeleton";
import { translations } from "@/infrastructure/i18n/translations";

describe("AuditSkeleton", () => {
  it("renders with status role, aria-busy and accessible loading label", () => {
    render(<AuditSkeleton />);

    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveAttribute("aria-label", translations.audit.loading);
    expect(screen.getByTestId("audit-skeleton")).toBeInTheDocument();
  });

  it("renders filter and table placeholder indicators with pulse animation", () => {
    const { container } = render(<AuditSkeleton />);

    expect(screen.getByTestId("audit-skeleton-filters")).toBeInTheDocument();
    expect(screen.getByTestId("audit-skeleton-table")).toBeInTheDocument();

    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
