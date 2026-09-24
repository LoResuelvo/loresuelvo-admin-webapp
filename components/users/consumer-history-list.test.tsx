import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConsumerHistoryItem } from "@/domain/users/consumer-history";
import { ConsumerHistoryList } from "./consumer-history-list";

describe("ConsumerHistoryList", () => {
  const sampleHistory: ConsumerHistoryItem[] = [
    {
      resourceId: 105,
      operationId: 105,
      resourceType: "work_order",
      categoryName: "Plomería",
      provider: {
        id: 201,
        name: "Juan Gómez",
        profilePhotoUrl: "https://example.com/avatar.jpg",
      },
      status: "completed",
      totalAmountCents: 2000000,
      createdAt: "2026-09-20T10:00:00-03:00",
    },
  ];

  it("renders chronological contracting history with all columns and operation link", () => {
    render(<ConsumerHistoryList history={sampleHistory} />);

    expect(screen.getByTestId("consumer-history-list")).toBeInTheDocument();
    expect(screen.getByText("20/09/2026")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
    expect(screen.getByText("Juan Gómez")).toBeInTheDocument();
    expect(screen.getByText("Completada")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Ver en Centro de Operaciones" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/operaciones/105");
  });

  it("renders empty state when history has no entries", () => {
    render(<ConsumerHistoryList history={[]} />);

    expect(
      screen.getByText("El consumidor no registra contrataciones previas"),
    ).toBeInTheDocument();
  });

  it("renders provider initial when photo is not available", () => {
    const historyWithoutPhoto: ConsumerHistoryItem[] = [
      {
        ...sampleHistory[0],
        provider: {
          id: 201,
          name: "Juan Gómez",
          profilePhotoUrl: undefined,
        },
      },
    ];

    render(<ConsumerHistoryList history={historyWithoutPhoto} />);

    expect(screen.getByLabelText("Juan Gómez")).toHaveTextContent("J");
  });
});
