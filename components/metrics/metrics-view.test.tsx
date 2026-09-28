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

const emptyFunnel: ConversionFunnel = {
  from: "2020-01-01",
  to: "2020-01-31",
  globalConversionRate: 0,
  steps: [],
};

const zeroCountsFunnel: ConversionFunnel = {
  from: "2020-01-01",
  to: "2020-01-31",
  globalConversionRate: 0,
  steps: [
    {
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 0,
      relativeConversion: 0,
      avgDurationMinutes: null,
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

  it("renders loading skeleton when isLoading is true", () => {
    render(<MetricsView isLoading={true} />);

    expect(screen.getByTestId("metrics-skeleton")).toBeInTheDocument();
  });

  it("renders error alert with retry button and calls onRetry when clicked", () => {
    const handleRetry = vi.fn();
    render(
      <MetricsView
        error="Error al cargar métricas"
        onRetry={handleRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Error al cargar métricas");
    const retryBtn = screen.getByRole("button", { name: "Reintentar" });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
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

  it("renders empty state when steps list is empty", () => {
    render(<MetricsView data={emptyFunnel} />);

    expect(screen.getByTestId("funnel-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No hay suficiente volumen para generar el embudo")).toBeInTheDocument();
    expect(screen.queryByTestId("global-conversion-rate")).not.toBeInTheDocument();
  });

  it("renders empty state when all step counts are zero", () => {
    render(<MetricsView data={zeroCountsFunnel} />);

    expect(screen.getByTestId("funnel-empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("global-conversion-rate")).not.toBeInTheDocument();
  });
});
