import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunnelChart } from "./funnel-chart";
import type { FunnelStepData } from "./types";

const mockSteps: FunnelStepData[] = [
  {
    stepName: "ai_diagnostics",
    label: "Diagnósticos IA",
    count: 250,
    conversionFromStart: 1.0,
    conversionFromPrevious: null,
    avgDurationMinutes: null,
  },
  {
    stepName: "requests_created",
    label: "Solicitudes publicadas",
    count: 180,
    conversionFromStart: 0.72,
    conversionFromPrevious: { rate: 0.72, numerator: 180, denominator: 250 },
    avgDurationMinutes: 15,
  },
  {
    stepName: "proposals_sent",
    label: "Propuestas comerciales",
    count: 140,
    conversionFromStart: 0.56,
    conversionFromPrevious: { rate: 0.77, numerator: 140, denominator: 180 },
    avgDurationMinutes: 240,
  },
];

describe("FunnelChart", () => {
  it("renders each step with label and volume", () => {
    render(<FunnelChart steps={mockSteps} />);

    expect(
      screen.getByRole("heading", { name: "Flujo de Conversión por Etapa" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("funnel-chart-step-ai_diagnostics"),
    ).toHaveTextContent("Diagnósticos IA");
    expect(
      screen.getByTestId("funnel-chart-step-ai_diagnostics"),
    ).toHaveTextContent("250");
    expect(
      screen.getByTestId("funnel-chart-step-requests_created"),
    ).toHaveTextContent("Solicitudes publicadas");
    expect(
      screen.getByTestId("funnel-chart-step-requests_created"),
    ).toHaveTextContent("180");
  });

  it("sizes each bar from the initial-base percentage and gives zero volume no width", () => {
    render(
      <FunnelChart
        steps={[
          ...mockSteps,
          {
            stepName: "deposits_paid",
            label: "Señas pagadas",
            count: 0,
            conversionFromStart: null,
            conversionFromPrevious: { rate: null, numerator: 0, denominator: 0 },
            avgDurationMinutes: null,
          },
        ]}
      />,
    );

    expect(screen.getByTestId("funnel-chart-bar-requests_created")).toHaveAttribute(
      "aria-valuenow",
      "72",
    );
    expect(screen.getByTestId("funnel-chart-bar-proposals_sent")).toHaveAttribute(
      "aria-valuenow",
      "56",
    );
    expect(screen.getByTestId("funnel-chart-bar-deposits_paid")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getByTestId("funnel-chart-bar-deposits_paid")).toHaveStyle({ width: "0%" });
  });
});
