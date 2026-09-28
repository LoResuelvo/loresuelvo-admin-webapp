import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunnelChart } from "./funnel-chart";
import type { FunnelStepData } from "./types";

const mockSteps: FunnelStepData[] = [
  {
    stepName: "ai_diagnostics",
    label: "Diagnósticos IA",
    count: 250,
    relativeConversion: 1.0,
    avgDurationMinutes: null,
  },
  {
    stepName: "requests_created",
    label: "Solicitudes publicadas",
    count: 180,
    relativeConversion: 0.72,
    avgDurationMinutes: 15,
  },
  {
    stepName: "proposals_sent",
    label: "Propuestas comerciales",
    count: 140,
    relativeConversion: 0.77,
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
});
