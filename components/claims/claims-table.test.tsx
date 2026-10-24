import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClaimsTable, type ClaimItem } from "./claims-table";

const mockClaims: ClaimItem[] = [
  {
    id: "101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: "sp-42",
    claimantType: "consumer",
    claimantName: "ana@example.com",
    categoryName: "Plomería",
    status: "in_review",
  },
  {
    id: "102",
    createdAt: "2026-09-22T14:30:00Z",
    operationId: "sp-43",
    claimantType: "provider",
    claimantName: "martin@example.com",
    categoryName: "Electricidad",
    status: "open",
  },
];

describe("ClaimsTable", () => {
  it("shows the claimant name first and email as secondary information", () => {
    const namedClaim: ClaimItem = {
      ...mockClaims[0],
      claimantName: "Ana Martínez",
      claimantEmail: "ana@example.com",
    };

    render(<ClaimsTable claims={[namedClaim]} />);

    const row = screen.getByText("Ana Martínez").closest("tr")!;
    expect(within(row).getByText("ana@example.com")).toBeInTheDocument();
    expect(within(row).getByText("Consumidor")).toBeInTheDocument();
  });

  it("renders table headers and rows with claim details", () => {
    render(<ClaimsTable claims={mockClaims} />);

    expect(
      screen.getByRole("table", { name: "Listado de reclamos e incidentes operativos" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Reclamante")).toBeInTheDocument();
    expect(screen.getByText("Demandado")).toBeInTheDocument();
    expect(screen.getByText("Rubro")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Urgencia")).toBeInTheDocument();

    const row0 = screen.getByText("ana@example.com").closest("tr")!;
    expect(within(row0).getByText("24/09/2026")).toBeInTheDocument();
    expect(within(row0).getByText("Consumidor")).toBeInTheDocument();
    expect(within(row0).getAllByText("No informado")).toHaveLength(2);
    expect(within(row0).getByText("Plomería")).toBeInTheDocument();
    expect(within(row0).getByText("En revisión")).toBeInTheDocument();

    const row1 = screen.getByText("martin@example.com").closest("tr")!;
    expect(within(row1).getByText("22/09/2026")).toBeInTheDocument();
    expect(within(row1).getByText("Prestador")).toBeInTheDocument();
    expect(within(row1).getAllByText("No informado")).toHaveLength(2);
    expect(within(row1).getByText("Electricidad")).toBeInTheDocument();
    expect(within(row1).getByText("Abierto")).toBeInTheDocument();
  });

  it("renders empty state when no claims exist", () => {
    render(<ClaimsTable claims={[]} />);
    expect(screen.getByText("No hay reclamos registrados en el sistema")).toBeInTheDocument();
  });

  it("renders custom empty message when provided", () => {
    render(<ClaimsTable claims={[]} emptyMessage="Mensaje personalizado vacío" />);
    expect(screen.getByText("Mensaje personalizado vacío")).toBeInTheDocument();
  });

  it("calls onSelectClaim when clicking a row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(<ClaimsTable claims={mockClaims} onSelectClaim={handleSelect} />);

    const row = screen.getByText("ana@example.com").closest("tr")!;
    await user.click(row);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockClaims[0]);
  });

  it("calls onSelectClaim when pressing Enter on a focused row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(<ClaimsTable claims={mockClaims} onSelectClaim={handleSelect} />);

    const row = screen.getByText("martin@example.com").closest("tr")!;
    row.focus();
    await user.keyboard("{Enter}");

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockClaims[1]);
  });
});
