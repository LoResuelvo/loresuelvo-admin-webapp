import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunnelEmptyState } from "./funnel-empty-state";
import { translations } from "@/infrastructure/i18n/translations";

describe("FunnelEmptyState", () => {
  it("renders default empty state message", () => {
    render(<FunnelEmptyState />);
    const emptyEl = screen.getByTestId("funnel-empty-state");
    expect(emptyEl).toBeInTheDocument();
    expect(emptyEl).toHaveTextContent(translations.metrics.empty);
  });

  it("renders custom message when provided", () => {
    render(<FunnelEmptyState message="Mensaje personalizado" />);
    expect(screen.getByText("Mensaje personalizado")).toBeInTheDocument();
  });
});
