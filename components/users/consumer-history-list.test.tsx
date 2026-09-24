import { fireEvent, render, screen, within } from "@testing-library/react";
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
    {
      resourceId: 106,
      operationId: 106,
      resourceType: "job_request",
      categoryName: "Gas",
      provider: {
        id: 202,
        name: "Pedro Gasista",
      },
      status: "pending",
      totalAmountCents: 1500000,
      createdAt: "2026-09-21T10:00:00-03:00",
    },
  ];

  it("renders chronological contracting history with all columns and operation link", () => {
    render(<ConsumerHistoryList history={sampleHistory} />);

    expect(screen.getByTestId("consumer-history-list")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("20/09/2026")).toBeInTheDocument();
    expect(within(table).getByText("Plomería")).toBeInTheDocument();
    expect(within(table).getByText("Juan Gómez")).toBeInTheDocument();
    expect(within(table).getByText("Completada")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: "Ver en Centro de Operaciones" });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/operaciones/105");
    expect(links[1]).toHaveAttribute("href", "/operaciones/106");
  });

  it("renders empty state when history has no entries", () => {
    render(<ConsumerHistoryList history={[]} />);

    expect(
      screen.getByText("El consumidor no registra contrataciones previas"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("consumer-history-filters"),
    ).not.toBeInTheDocument();
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

  it("filters history reactively by interaction type and status", () => {
    render(<ConsumerHistoryList history={sampleHistory} />);

    const table = screen.getByRole("table");
    expect(within(table).getByText("Plomería")).toBeInTheDocument();
    expect(within(table).getByText("Gas")).toBeInTheDocument();

    const typeSelect = screen.getByRole("combobox", { name: "Tipo de interacción" });
    const statusSelect = screen.getByRole("combobox", { name: "Estado" });

    fireEvent.change(typeSelect, { target: { value: "work_order" } });
    fireEvent.change(statusSelect, { target: { value: "completed" } });

    expect(within(table).getByText("Plomería")).toBeInTheDocument();
    expect(within(table).queryByText("Gas")).not.toBeInTheDocument();
  });

  it("renders empty filtered message when no interactions match selected filters", () => {
    render(<ConsumerHistoryList history={sampleHistory} />);

    const typeSelect = screen.getByRole("combobox", { name: "Tipo de interacción" });
    fireEvent.change(typeSelect, { target: { value: "service_proposal" } });

    expect(
      screen.getByText("No se encontraron interacciones con los filtros seleccionados"),
    ).toBeInTheDocument();
  });
});
