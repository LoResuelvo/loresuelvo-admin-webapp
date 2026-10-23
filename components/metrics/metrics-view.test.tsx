import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetricsView } from "./metrics-view";
import type { ConversionFunnel, FunnelStepMetric } from "@/domain/metrics/funnel";
import { getFunnelAction } from "@/app/(dashboard)/metricas/actions";

vi.mock("@/app/(dashboard)/metricas/actions", () => ({
  getFunnelAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      from: "2026-08-25",
      to: "2026-09-24",
      cohorts: {
        ai: {
          source: "ai",
          initialUnit: "professional_assessment",
          categorySource: null,
          globalConversionRate: 0.32,
          globalConversionNumerator: 0,
          globalConversionDenominator: 0,
          delays: {},
          steps: [],
        },
      },
    },
  }),
}));

function aiFunnel(
  from: string,
  to: string,
  steps: FunnelStepMetric[],
  globalConversionRate: number | null,
  globalConversionNumerator = 0,
): ConversionFunnel {
  return {
    from,
    to,
    cohorts: {
      ai: {
        source: "ai",
        initialUnit: "professional_assessment",
        categorySource: "assessment.problem_category_id",
        globalConversionRate,
        globalConversionNumerator,
        globalConversionDenominator: steps[0]?.count ?? 0,
        delays: {},
        steps,
      },
    },
  };
}

const mockFunnel = aiFunnel(
  "2026-08-25",
  "2026-09-24",
  [
    {
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 250,
      conversionFromStart: 1,
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
  ],
  0.32,
);

const emptyFunnel = aiFunnel("2020-01-01", "2020-01-31", [], null);

const zeroCountsFunnel = aiFunnel(
  "2020-01-01",
  "2020-01-31",
  [
    {
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 0,
      conversionFromStart: null,
      conversionFromPrevious: null,
      avgDurationMinutes: null,
    },
  ],
  null,
);

describe("MetricsView", () => {
  beforeEach(() => {
    vi.mocked(getFunnelAction).mockClear();
  });

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
        categoryOptions={[{ id: 47, name: "Climatización" }]}
        selectedCategoryId=""
        onCategoryChange={handleCategoryChange}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Rubro" });
    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: "47" } });
    expect(handleCategoryChange).toHaveBeenCalledWith(47);
  });

  it("uses the provided catalog id and initial date range in the funnel request", async () => {
    render(
      <MetricsView
        data={mockFunnel}
        categoryOptions={[{ id: 47, name: "Climatización" }]}
        initialFromDate="2026-09-02"
        initialToDate="2026-10-02"
      />,
    );

    const category = screen.getByRole("combobox", { name: "Rubro" });
    expect(screen.getByRole("option", { name: "Climatización" })).toBeInTheDocument();
    fireEvent.change(category, { target: { value: "47" } });

    await waitFor(() => {
      expect(getFunnelAction).toHaveBeenCalledWith({
        from: "2026-09-02",
        to: "2026-10-02",
        categoryId: 47,
      });
    });
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


it("uses completed orders rather than reviews for the API completion conversion", () => {
  const data = aiFunnel(
    "2026-09-01",
    "2026-09-02",
    [
      {
        stepName: "ai_diagnostics",
        label: "Diagnósticos IA",
        count: 3,
        conversionFromStart: 1,
        conversionFromPrevious: null,
      },
      {
        stepName: "orders_completed",
        label: "Órdenes concluidas",
        count: 2,
        conversionFromStart: 0.6667,
        conversionFromPrevious: { rate: 0.6667, numerator: 2, denominator: 3 },
      },
      {
        stepName: "reviews_submitted",
        label: "Reseñas enviadas",
        count: 1,
        conversionFromStart: 0.3333,
        conversionFromPrevious: { rate: 0.5, numerator: 1, denominator: 2 },
      },
    ],
    0.6667,
    2,
  );
  render(<MetricsView data={data} />);
  const overview = screen.getByRole("region", { name: "Resumen de conversión global" });
  expect(overview).toHaveTextContent("Finalizaciones reportadas: 2");
  expect(overview).toHaveTextContent("Base inicial: 3 evaluaciones profesionales");
});
