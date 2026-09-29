import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditTable, type AuditTableItem } from "./audit-table";

const mockEntries: AuditTableItem[] = [
  {
    id: "aud-001",
    timestamp: "2026-09-28T14:30:00Z",
    operatorId: "op-101",
    operatorEmail: "operador@loresuelvo.com",
    action: "chat_access",
    resourceType: "operation",
    resourceId: "105",
    reason: "Investigación de reporte por posible fraude",
  },
  {
    id: "aud-002",
    timestamp: "2026-09-27T10:15:00Z",
    operatorId: "op-102",
    operatorEmail: "soporte@loresuelvo.com",
    action: "claim_resolution",
    actionLabel: "Resolución de reclamo",
    resourceType: "claim",
    resourceId: "clm-204",
    reason: "Resolución de disputa económica",
  },
];

describe("AuditTable", () => {
  it("renders table headers and entries with details", () => {
    render(<AuditTable entries={mockEntries} />);

    expect(
      screen.getByRole("table", { name: "Bitácora de auditoría de intervenciones de operadores" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Fecha y hora")).toBeInTheDocument();
    expect(screen.getByText("Operador")).toBeInTheDocument();
    expect(screen.getByText("Recurso")).toBeInTheDocument();
    expect(screen.getByText("Acción")).toBeInTheDocument();
    expect(screen.getByText("Motivo")).toBeInTheDocument();

    const row0 = screen.getByText("operador@loresuelvo.com").closest("tr")!;
    expect(within(row0).getByText(/28\/09\/2026/)).toBeInTheDocument();
    expect(within(row0).getByText("Contratación #105")).toBeInTheDocument();
    expect(within(row0).getByText("Acceso a chat privado")).toBeInTheDocument();
    expect(within(row0).getByText("Investigación de reporte por posible fraude")).toBeInTheDocument();

    const row1 = screen.getByText("soporte@loresuelvo.com").closest("tr")!;
    expect(within(row1).getByText(/27\/09\/2026/)).toBeInTheDocument();
    expect(within(row1).getByText("Reclamo #clm-204")).toBeInTheDocument();
    expect(within(row1).getByText("Resolución de reclamo")).toBeInTheDocument();
    expect(within(row1).getByText("Resolución de disputa económica")).toBeInTheDocument();
  });

  it("renders empty message when entries list is empty", () => {
    render(<AuditTable entries={[]} />);
    expect(screen.getByText("No hay registros de auditoría")).toBeInTheDocument();
  });

  it("renders custom empty message when provided", () => {
    render(<AuditTable entries={[]} emptyMessage="Sin intervenciones filtradas" />);
    expect(screen.getByText("Sin intervenciones filtradas")).toBeInTheDocument();
  });

  it("triggers onSelectEntry callback when clicking a row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(<AuditTable entries={mockEntries} onSelectEntry={handleSelect} />);

    const row = screen.getByText("operador@loresuelvo.com").closest("tr")!;
    await user.click(row);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockEntries[0]);
  });

  it("triggers onSelectEntry callback when pressing Enter on a focused row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(<AuditTable entries={mockEntries} onSelectEntry={handleSelect} />);

    const row = screen.getByText("soporte@loresuelvo.com").closest("tr")!;
    row.focus();
    await user.keyboard("{Enter}");

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockEntries[1]);
  });
});
