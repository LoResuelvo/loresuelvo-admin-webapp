import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ROUTES } from "@/lib/routes";
import { ProviderActivitySummary } from "./provider-activity-summary";

describe("ProviderActivitySummary", () => {
  const activitySummaryMock = {
    totalRequests: 14,
    activeOrders: 2,
    completedOrders: 10,
    averageRating: 4.8,
    reviewsCount: 9,
    recentOperations: [
      {
        id: 105,
        categoryName: "Plomería",
        consumerName: "Carlos López",
        status: "in_progress",
        createdAt: "2026-09-21T09:30:00-03:00",
      },
      {
        id: 106,
        categoryName: "Plomería",
        consumerName: "Ana Martínez",
        status: "completed",
        createdAt: "2026-09-20T14:00:00-03:00",
      },
    ],
  };

  it("renders activity summary metrics and operations list", () => {
    render(<ProviderActivitySummary activitySummary={activitySummaryMock} />);

    expect(screen.getByTestId("provider-activity-summary")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("(9 opiniones)")).toBeInTheDocument();

    expect(screen.getByText("Carlos López")).toBeInTheDocument();
    expect(screen.getByText("Ana Martínez")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: /ver en centro de operaciones/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", ROUTES.operationDetail(105));
    expect(links[1]).toHaveAttribute("href", ROUTES.operationDetail(106));
  });

  it("renders empty operations state when list is empty", () => {
    render(
      <ProviderActivitySummary
        activitySummary={{
          ...activitySummaryMock,
          recentOperations: [],
        }}
      />,
    );

    expect(
      screen.getByText("No registra contrataciones recientes"),
    ).toBeInTheDocument();
  });

  it("renders empty activity state when activitySummary is undefined", () => {
    render(<ProviderActivitySummary activitySummary={undefined} />);

    expect(screen.getByTestId("provider-activity-summary")).toBeInTheDocument();
    expect(
      screen.getByText("No registra actividad previa de solicitudes u órdenes"),
    ).toBeInTheDocument();
  });
});
