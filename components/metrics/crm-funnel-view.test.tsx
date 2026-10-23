import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConversionFunnel, FunnelCohort } from "@/domain/metrics/funnel";
import { MetricsView } from "./metrics-view";

function aCohort(
  source: FunnelCohort["source"],
  initialUnit: FunnelCohort["initialUnit"],
  steps: FunnelCohort["steps"],
  globalConversionRate: number,
  globalConversionNumerator: number,
  globalConversionDenominator: number,
): FunnelCohort {
  return {
    source,
    initialUnit,
    categorySource: source === "ai" ? "assessment.problem_category_id" : "provider.current_category_id",
    globalConversionRate,
    globalConversionNumerator,
    globalConversionDenominator,
    delays: {
      requestToFirstProposal: { observations: 0, meanSeconds: null },
      proposalToConfirmedHiring: { observations: 0, meanSeconds: null },
      confirmedHiringToReportedCompletion: { observations: 0, meanSeconds: null },
      reportedCompletionToFullPayment: { observations: 0, meanSeconds: null },
    },
    steps,
  };
}

const funnel: ConversionFunnel = {
  from: "2026-10-15T03:00:00Z",
  to: "2026-10-23T03:00:00Z",
  metadata: { timezone: "America/Argentina/Buenos_Aires" },
  cohorts: {
    ai: aCohort(
      "ai",
      "professional_assessment",
      [
        {
          stepName: "ai_diagnostics",
          label: "Diagnósticos IA",
          count: 100,
          conversionFromStart: 1,
          conversionFromPrevious: null,
          avgDurationMinutes: null,
        },
        {
          stepName: "requests_created",
          label: "Solicitudes publicadas",
          count: 60,
          conversionFromStart: 0.6,
          conversionFromPrevious: { rate: 0.6, numerator: 60, denominator: 100 },
          avgDurationMinutes: null,
        },
        {
          stepName: "proposals_sent",
          label: "Propuestas comerciales",
          count: 30,
          conversionFromStart: 0.3,
          conversionFromPrevious: { rate: 0.5, numerator: 30, denominator: 60 },
          avgDurationMinutes: null,
        },
      ],
      0.3,
      30,
      100,
    ),
    manual: aCohort(
      "manual",
      "request",
      [
        {
          stepName: "requests_created",
          label: "Solicitudes publicadas",
          count: 3,
          conversionFromStart: 1,
          conversionFromPrevious: null,
          avgDurationMinutes: null,
        },
        {
          stepName: "proposals_sent",
          label: "Propuestas comerciales",
          count: 2,
          conversionFromStart: 0.6667,
          conversionFromPrevious: { rate: 0.6667, numerator: 2, denominator: 3 },
          avgDurationMinutes: null,
        },
        {
          stepName: "deposits_paid",
          label: "Señas pagadas",
          count: 1,
          conversionFromStart: 0.3333,
          conversionFromPrevious: { rate: 0.5, numerator: 1, denominator: 2 },
          avgDurationMinutes: null,
        },
        {
          stepName: "orders_completed",
          label: "Órdenes concluidas",
          count: 1,
          conversionFromStart: 0.3333,
          conversionFromPrevious: { rate: 1, numerator: 1, denominator: 1 },
          avgDurationMinutes: null,
        },
        {
          stepName: "full_payments",
          label: "Pagos completos",
          count: 0,
          conversionFromStart: 0,
          conversionFromPrevious: { rate: 0, numerator: 0, denominator: 1 },
          avgDurationMinutes: null,
        },
        {
          stepName: "reviews_submitted",
          label: "Reseñas enviadas",
          count: 0,
          conversionFromStart: 0,
          conversionFromPrevious: { rate: null, numerator: 0, denominator: 0 },
          avgDurationMinutes: null,
        },
      ],
      0.3333,
      1,
      3,
    ),
  },
};

describe("CRM funnel source selection", () => {
  it("switches to the manual cohort without showing AI evaluations or mixing global denominators", () => {
    render(<MetricsView data={funnel} />);

    const source = screen.getByRole("combobox", { name: "Origen" });
    fireEvent.change(source, { target: { value: "manual" } });

    expect(screen.queryByTestId("funnel-step-ai_diagnostics")).not.toBeInTheDocument();
    expect(screen.getByTestId("funnel-step-requests_created")).toBeInTheDocument();
    const overview = screen.getByRole("region", { name: "Resumen de conversión global" });
    expect(overview).toHaveTextContent("Finalizaciones reportadas: 1");
    expect(overview).toHaveTextContent("Base inicial: 3 solicitudes manuales");
    expect(screen.getByTestId("funnel-initial-unit")).toHaveTextContent("solicitud manual");
    expect(screen.getByTestId("retention-proposals_sent")).toHaveTextContent("2 de 3");
  });

  it("switches to the comparison view showing AI and manual request cohorts with period notice and separate denominators", () => {
    const comparisonFunnel: ConversionFunnel = {
      ...funnel,
      requestComparison: {
        ai: aCohort(
          "ai",
          "request",
          [
            {
              stepName: "requests_created",
              label: "Solicitudes publicadas",
              count: 2,
              conversionFromStart: 1,
              conversionFromPrevious: null,
              avgDurationMinutes: null,
            },
            {
              stepName: "proposals_sent",
              label: "Propuestas comerciales",
              count: 1,
              conversionFromStart: 0.5,
              conversionFromPrevious: { rate: 0.5, numerator: 1, denominator: 2 },
              avgDurationMinutes: null,
            },
            {
              stepName: "deposits_paid",
              label: "Señas pagadas",
              count: 1,
              conversionFromStart: 0.5,
              conversionFromPrevious: { rate: 1, numerator: 1, denominator: 1 },
              avgDurationMinutes: null,
            },
            {
              stepName: "orders_completed",
              label: "Órdenes concluidas",
              count: 1,
              conversionFromStart: 0.5,
              conversionFromPrevious: { rate: 1, numerator: 1, denominator: 1 },
              avgDurationMinutes: null,
            },
            {
              stepName: "full_payments",
              label: "Pagos completos",
              count: 0,
              conversionFromStart: 0,
              conversionFromPrevious: { rate: 0, numerator: 0, denominator: 1 },
              avgDurationMinutes: null,
            },
            {
              stepName: "reviews_submitted",
              label: "Reseñas enviadas",
              count: 0,
              conversionFromStart: 0,
              conversionFromPrevious: { rate: null, numerator: 0, denominator: 0 },
              avgDurationMinutes: null,
            },
          ],
          0.5,
          1,
          2,
        ),
        manual: funnel.cohorts.manual!,
      },
    };

    render(<MetricsView data={comparisonFunnel} />);

    const source = screen.getByRole("combobox", { name: "Origen" });
    fireEvent.change(source, { target: { value: "comparison" } });

    expect(screen.getByTestId("funnel-comparison-notice")).toBeInTheDocument();
    expect(screen.getByTestId("funnel-comparison-notice")).toHaveTextContent(/período selecciona la creación de las solicitudes/i);

    const aiPanel = screen.getByTestId("funnel-comparison-panel-ai");
    const manualPanel = screen.getByTestId("funnel-comparison-panel-manual");

    expect(aiPanel).toBeInTheDocument();
    expect(manualPanel).toBeInTheDocument();

    expect(aiPanel).toHaveTextContent("Base inicial: 2 solicitudes IA");
    expect(manualPanel).toHaveTextContent("Base inicial: 3 solicitudes manuales");

    expect(aiPanel.querySelector('[data-testid="funnel-step-ai_diagnostics"]')).toBeNull();
    expect(manualPanel.querySelector('[data-testid="funnel-step-ai_diagnostics"]')).toBeNull();

    expect(screen.getByTestId("funnel-category-criterion-ai")).toHaveTextContent(/rubro actual del prestador/i);
    expect(screen.getByTestId("funnel-category-criterion-manual")).toHaveTextContent(/rubro actual del prestador/i);
  });
});
