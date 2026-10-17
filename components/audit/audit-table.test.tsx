import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditTable, type AuditTableItem } from "./audit-table";

const mockEntries: AuditTableItem[] = [
  {
    id: "018f3f3a-8e75-7bc4-9a50-8f512998d110",
    occurredOn: "2026-09-28T14:30:00Z",
    operatorId: 101,
    action: "access",
    resourceType: "operation",
    resourceId: "105",
    reason: "Investigación de reporte por posible fraude",
    correlationId: "trace-001",
    result: "succeeded",
  },
  {
    id: "018f3f3a-8e75-7bc4-9a50-8f512998d111",
    occurredOn: "2026-09-27T10:15:00Z",
    operatorId: 102,
    action: "execute",
    resourceType: "claim",
    resourceId: "clm-204",
    reason: "Resolución de disputa económica",
    correlationId: "trace-002",
    result: "prepared",
  },
];

describe("AuditTable", () => {
  it("renders API event IDs, resource, action, result, and reason", () => {
    render(<AuditTable entries={mockEntries} />);

    expect(screen.getByRole("table", { name: "Bitácora de auditoría de intervenciones de operadores" })).toBeInTheDocument();
    expect(screen.getByText("Fecha y hora")).toBeInTheDocument();
    expect(screen.getByText("ID del operador")).toBeInTheDocument();
    expect(screen.getByText("Recurso")).toBeInTheDocument();
    expect(screen.getByText("Acción")).toBeInTheDocument();
    expect(screen.getByText("Resultado")).toBeInTheDocument();
    expect(screen.getByText("Motivo")).toBeInTheDocument();

    const row0 = screen.getByText("101").closest("tr")!;
    expect(within(row0).getByText(/28\/09\/2026/)).toBeInTheDocument();
    expect(within(row0).getByText("Contratación #105")).toBeInTheDocument();
    expect(within(row0).getByText("Acceso")).toBeInTheDocument();
    expect(within(row0).getByText("Exitoso")).toBeInTheDocument();
    expect(within(row0).getByText("Investigación de reporte por posible fraude")).toBeInTheDocument();

    const row1 = screen.getByText("102").closest("tr")!;
    expect(within(row1).getByText(/27\/09\/2026/)).toBeInTheDocument();
    expect(within(row1).getByText("Reclamo #clm-204")).toBeInTheDocument();
    expect(within(row1).getByText("Ejecución")).toBeInTheDocument();
    expect(within(row1).getByText("Preparado")).toBeInTheDocument();
    expect(within(row1).getByText("Resolución de disputa económica")).toBeInTheDocument();
  });

  it("shows unavailable optional fields without inventing values", () => {
    render(<AuditTable entries={[{ ...mockEntries[0], resourceId: undefined, reason: undefined }]} />);

    const row = screen.getByText("101").closest("tr")!;
    expect(within(row).getByText("operation — No disponible")).toBeInTheDocument();
  });

  it("renders empty messages", () => {
    const { rerender } = render(<AuditTable entries={[]} />);
    expect(screen.getByText("No hay registros de auditoría")).toBeInTheDocument();

    rerender(<AuditTable entries={[]} emptyMessage="Sin intervenciones filtradas" />);
    expect(screen.getByText("Sin intervenciones filtradas")).toBeInTheDocument();
  });

  it("triggers onSelectEntry when clicking or pressing Enter on a row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    render(<AuditTable entries={mockEntries} onSelectEntry={handleSelect} />);

    const firstRow = screen.getByText("101").closest("tr")!;
    await user.click(firstRow);
    expect(handleSelect).toHaveBeenCalledWith(mockEntries[0]);

    handleSelect.mockClear();
    const secondRow = screen.getByText("102").closest("tr")!;
    secondRow.focus();
    await user.keyboard("{Enter}");
    expect(handleSelect).toHaveBeenCalledWith(mockEntries[1]);
  });
});
