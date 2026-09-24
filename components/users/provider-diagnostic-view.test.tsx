import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProviderDiagnosticView } from "./provider-diagnostic-view";

describe("ProviderDiagnosticView", () => {
  const diagnosticMock = {
    id: 201,
    name: "Juan",
    surname: "Gómez",
    email: "juan@example.com",
    phone: "+54 11 5555-0101",
    profilePhotoUrl: "https://example.com/photo.jpg",
    category: { id: 2, name: "Plomería" },
    coverageZones: [
      { id: 6, name: "Comuna 6", isActive: true },
    ],
    identityVerification: {
      status: "approved",
      verifiedAt: "2026-09-15T12:00:00-03:00",
    },
    paymentConnection: {
      isConnected: true,
      accountId: "mp-acc-8812",
      canReceivePayments: true,
    },
    calendarConnection: {
      status: "connected",
    },
  };

  it("renders the diagnostic view container with profile and conditions", () => {
    render(<ProviderDiagnosticView diagnostic={diagnosticMock} />);

    expect(
      screen.getByRole("region", { name: "Diagnóstico operativo del prestador" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Juan Gómez" })).toBeInTheDocument();
    expect(screen.getByTestId("operational-conditions-panel")).toBeInTheDocument();
    expect(screen.getByTestId("provider-activity-summary")).toBeInTheDocument();
  });

  it("renders activity summary metrics and operations when provided", () => {
    const diagnosticWithActivity = {
      ...diagnosticMock,
      activitySummary: {
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
        ],
      },
    };

    render(<ProviderDiagnosticView diagnostic={diagnosticWithActivity} />);

    expect(screen.getByTestId("provider-activity-summary")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
  });
});
