import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MetricsView } from "./metrics-view";
import type { ConversionFunnel } from "@/domain/metrics/funnel";

const mockFunnel: ConversionFunnel = {
  from: "2026-08-25",
  to: "2026-09-24",
  globalConversionRate: 0.32,
  steps: [
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
  ],
};

describe("MetricsView", () => {
  it("renders funnel overview, chart, and step cards", () => {
    render(<MetricsView data={mockFunnel} />);

    expect(
      screen.getByRole("heading", { name: "Métricas de Conversión Operativa" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("global-conversion-rate")).toHaveTextContent("32%");
    expect(
      screen.getByTestId("funnel-step-ai_diagnostics"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("funnel-step-requests_created"),
    ).toBeInTheDocument();
  });

  it("renders forbidden alert when isForbidden is true", () => {
    render(<MetricsView isForbidden={true} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /restringido/i,
    );
  });

  it("renders error alert with retry button when error is provided", () => {
    render(<MetricsView error="Error al cargar métricas" onRetry={() => {}} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Error al cargar métricas");
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("renders filter bar and triggers onPeriodChange when period changes", () => {
    const handlePeriodChange = vi.fn();
    render(
      <MetricsView
        data={mockFunnel}
        selectedPeriod="7d"
        onPeriodChange={handlePeriodChange}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Rango temporal" });
    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: "30d" } });
    expect(handlePeriodChange).toHaveBeenCalledWith("30d");
  });

  it("triggers onCategoryChange when category changes", () => {
    const handleCategoryChange = vi.fn();
    render(
      <MetricsView
        data={mockFunnel}
        selectedCategoryId=""
        onCategoryChange={handleCategoryChange}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Rubro" });
    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: "1" } });
    expect(handleCategoryChange).toHaveBeenCalledWith(1);
  });
});
