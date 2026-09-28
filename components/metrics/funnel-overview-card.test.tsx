import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunnelOverviewCard } from "./funnel-overview-card";

describe("FunnelOverviewCard", () => {
  it("renders global conversion rate and title", () => {
    render(
      <FunnelOverviewCard
        globalConversionRate={0.32}
        initialCount={250}
        finalCount={80}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Tasa de conversión global" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("global-conversion-rate")).toHaveTextContent("32%");
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
  });
});
