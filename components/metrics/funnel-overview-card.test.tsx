import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunnelOverviewCard } from "./funnel-overview-card";

describe("FunnelOverviewCard", () => {
  it("renders global conversion rate and title", () => {
    render(
      <FunnelOverviewCard
        source="ai"
        initialUnit="professional_assessment"
        globalConversionRate={0.32}
        globalConversionNumerator={80}
        globalConversionDenominator={250}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Tasa de conversión global" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("global-conversion-rate")).toHaveTextContent("32%");
    expect(screen.getByTestId("global-conversion-count")).toHaveTextContent("80 de 250");
    expect(screen.getByTestId("global-conversion-count")).toHaveAccessibleName(
      "80 finalizaciones reportadas de 250 evaluaciones profesionales",
    );
    expect(screen.queryByText(/hasta la reseña del servicio/)).not.toBeInTheDocument();
  });
});
