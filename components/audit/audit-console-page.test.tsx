import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditConsolePage } from "./audit-console-page";
import type { AuditLogEntry } from "@/domain/audit/audit-log";

vi.mock("@/app/(dashboard)/auditoria/actions", () => ({
  getAuditLogsAction: vi.fn(),
}));

import { getAuditLogsAction } from "@/app/(dashboard)/auditoria/actions";

const mockEntries: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-09-28T14:30:00Z",
    operatorId: "op-101",
    operatorEmail: "operador@loresuelvo.com",
    action: "chat_access",
    actionLabel: "Acceso a chat privado",
    resourceType: "operation",
    resourceId: "105",
    reason: "Investigación de reporte por posible fraude",
    ipAddress: "192.168.1.50",
    userAgent: "Mozilla/5.0",
    status: "success",
  },
];

describe("AuditConsolePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton initially and then displays entries", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({
      success: true,
      data: mockEntries,
    });

    render(<AuditConsolePage />);

    expect(screen.getByLabelText("Cargando bitácora de auditoría...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("operador@loresuelvo.com")).toBeInTheDocument();
    });

    expect(screen.getByText("Contratación #105")).toBeInTheDocument();
  });

  it("displays forbidden message when user lacks permissions", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({
      success: false,
      error: "No posees permisos suficientes para acceder a la consola de auditoría.",
      isForbidden: true,
    });

    render(<AuditConsolePage />);

    await waitFor(() => {
      expect(
        screen.getByText("No posees permisos suficientes para acceder a la consola de auditoría."),
      ).toBeInTheDocument();
    });

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
  });

  it("displays error message and allows retry", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValueOnce({
      success: false,
      error: "Ocurrió un error al cargar la bitácora de auditoría.",
    });

    render(<AuditConsolePage />);

    await waitFor(() => {
      expect(screen.getByText("Ocurrió un error al cargar la bitácora de auditoría.")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    expect(retryButton).toBeInTheDocument();

    vi.mocked(getAuditLogsAction).mockResolvedValueOnce({
      success: true,
      data: mockEntries,
    });

    retryButton.click();

    await waitFor(() => {
      expect(screen.getByText("operador@loresuelvo.com")).toBeInTheDocument();
    });
  });

  it("filters entries when action is selected in AuditFiltersBar", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({
      success: true,
      data: mockEntries,
    });

    render(<AuditConsolePage />);

    await waitFor(() => {
      expect(screen.getByText("operador@loresuelvo.com")).toBeInTheDocument();
    });

    const select = screen.getByLabelText("Filtrar por acción");
    expect(select).toBeInTheDocument();
  });

  it("renders operator search input in AuditFiltersBar", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({
      success: true,
      data: mockEntries,
    });

    render(<AuditConsolePage />);

    await waitFor(() => {
      expect(screen.getByText("operador@loresuelvo.com")).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("Buscar por operador");
    expect(searchInput).toBeInTheDocument();
  });

  it("passes date range filters to getAuditLogsAction", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({
      success: true,
      data: mockEntries,
    });

    render(
      <AuditConsolePage
        initialFilters={{ from: "2026-09-01", to: "2026-09-20" }}
      />,
    );

    await waitFor(() => {
      expect(getAuditLogsAction).toHaveBeenCalledWith({
        from: "2026-09-01",
        to: "2026-09-20",
      });
    });
  });

  it("opens audit detail modal when clicking a row in the table", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({
      success: true,
      data: mockEntries,
    });

    render(<AuditConsolePage />);

    await waitFor(() => {
      expect(screen.getByText("operador@loresuelvo.com")).toBeInTheDocument();
    });

    const row = screen.getByText("operador@loresuelvo.com").closest("tr")!;
    row.click();

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Detalle de intervención")).toBeInTheDocument();
      expect(screen.getByText("aud-001")).toBeInTheDocument();
      expect(screen.getByText("192.168.1.xxx")).toBeInTheDocument();
    });
  });
});

