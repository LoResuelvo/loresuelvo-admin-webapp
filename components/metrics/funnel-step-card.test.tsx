import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunnelStepCard } from "./funnel-step-card";
import type { FunnelStepData } from "./types";

const mockStep: FunnelStepData = {
  stepName: "proposals_sent",
  label: "Propuestas comerciales",
  count: 140,
  conversionFromStart: 0.56,
  conversionFromPrevious: { rate: 0.77, numerator: 140, denominator: 180 },
  avgDurationMinutes: 240,
};

describe("FunnelStepCard", () => {
  it("renders step label, count, and progress", () => {
    render(
      <FunnelStepCard
        step={mockStep}
        index={2}
        totalSteps={6}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Propuestas comerciales" }),
    ).toBeInTheDocument();
    expect(screen.getByText("140")).toBeInTheDocument();
    expect(screen.getByText("Paso 3 de 6")).toBeInTheDocument();
    expect(screen.getByTestId("retention-proposals_sent")).toHaveTextContent("77% (140 de 180)");
    expect(screen.getByTestId("funnel-step-progress-proposals_sent")).toHaveAttribute(
      "aria-valuenow",
      "56",
    );
    expect(screen.getByTestId("duration-proposals_sent")).toHaveTextContent("4 h");
  });

  it("marks the first step as having no previous transition", () => {
    const firstStep: FunnelStepData = {
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 250,
      conversionFromStart: 1.0,
      conversionFromPrevious: null,
      avgDurationMinutes: null,
    };

    render(
      <FunnelStepCard
        step={firstStep}
        index={0}
        totalSteps={6}
      />,
    );

    expect(screen.getByTestId("retention-ai_diagnostics")).toHaveTextContent("No disponible");
    expect(screen.getByTestId("duration-ai_diagnostics")).toHaveTextContent("-");
  });
});
