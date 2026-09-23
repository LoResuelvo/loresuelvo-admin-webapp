import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OperationsTable, type OperationSummary } from "./operations-table";

const mockOperations: OperationSummary[] = [
  {
    id: "op-1",
    jobRequestId: 101,
    serviceProposalId: 201,
    workOrderId: 301,
    consumer: {
      id: 1,
      name: "Juan",
      surname: "Pérez",
      email: "juan.perez@example.com",
    },
    provider: {
      id: 2,
      name: "Carlos",
      surname: "López",
      email: "carlos.lopez@example.com",
    },
    category: {
      id: 1,
      name: "Plomería",
    },
    status: "in_progress",
    bottleneck: "stalled",
    nextActionBy: "provider",
    createdAt: "2026-09-18T10:00:00Z",
    updatedAt: "2026-09-20T14:30:00Z",
  },
  {
    id: "op-2",
    jobRequestId: 102,
    serviceProposalId: 202,
    consumer: {
      id: 3,
      name: "María",
      surname: "Gómez",
      email: "maria.gomez@example.com",
    },
    provider: {
      id: 4,
      name: "Roberto",
      surname: "Díaz",
      email: "roberto.diaz@example.com",
    },
    category: {
      id: 2,
      name: "Electricidad",
    },
    status: "quoted",
    bottleneck: "pending_proposal_24h",
    nextActionBy: "consumer",
    createdAt: "2026-09-21T09:00:00Z",
    updatedAt: "2026-09-22T11:00:00Z",
  },
];

describe("OperationsTable", () => {
  it("renders table headers correctly", () => {
    render(<OperationsTable operations={mockOperations} />);

    expect(screen.getByRole("columnheader", { name: "Cliente" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Prestador" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Rubro" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Estado" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Alerta Operativa" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Responsable" })).toBeInTheDocument();
  });

  it("renders operation data for each row", () => {
    render(<OperationsTable operations={mockOperations} />);

    const rows = screen.getAllByRole("row");
    // Row 0 is the header, Row 1 is op-1, Row 2 is op-2
    const row1 = within(rows[1]);
    expect(row1.getByText("Juan Pérez")).toBeInTheDocument();
    expect(row1.getByText("juan.perez@example.com")).toBeInTheDocument();
    expect(row1.getByText("Carlos López")).toBeInTheDocument();
    expect(row1.getByText("carlos.lopez@example.com")).toBeInTheDocument();
    expect(row1.getByText("Plomería")).toBeInTheDocument();
    expect(row1.getByText("En progreso")).toBeInTheDocument();
    expect(row1.getByText("Estancada > 24h")).toBeInTheDocument();
    expect(row1.getByText("Prestador")).toBeInTheDocument();

    const row2 = within(rows[2]);
    expect(row2.getByText("María Gómez")).toBeInTheDocument();
    expect(row2.getByText("maria.gomez@example.com")).toBeInTheDocument();
    expect(row2.getByText("Roberto Díaz")).toBeInTheDocument();
    expect(row2.getByText("roberto.diaz@example.com")).toBeInTheDocument();
    expect(row2.getByText("Electricidad")).toBeInTheDocument();
    expect(row2.getByText("Cotizado")).toBeInTheDocument();
    expect(row2.getByText("Propuesta demorada > 24h")).toBeInTheDocument();
    expect(row2.getByText("Cliente")).toBeInTheDocument();
  });

  it("calls onSelectOperation when row is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<OperationsTable operations={mockOperations} onSelectOperation={handleSelect} />);

    await user.click(screen.getByText("Juan Pérez"));
    expect(handleSelect).toHaveBeenCalledWith(mockOperations[0]);
  });
});
