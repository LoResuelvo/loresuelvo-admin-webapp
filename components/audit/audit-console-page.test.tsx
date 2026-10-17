import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditConsolePage } from "./audit-console-page";
import type { AuditLogEntry, AuditLogsPage } from "@/domain/audit/audit-log";

vi.mock("@/app/(dashboard)/auditoria/actions", () => ({
  getAuditLogsAction: vi.fn(),
}));

import { getAuditLogsAction } from "@/app/(dashboard)/auditoria/actions";

const mockEntries: AuditLogEntry[] = [
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
];

function page(events: readonly AuditLogEntry[] = mockEntries, nextCursor: string | null = null): AuditLogsPage {
  return { events, nextCursor };
}

describe("AuditConsolePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["success", "forbidden", "rejection"] as const)("ignores stale %s while the latest search is loading and after it resolves", async (outcome) => {
    let resolveOld!: (value: Awaited<ReturnType<typeof getAuditLogsAction>>) => void;
    let rejectOld!: (error: Error) => void;
    let resolveLatest!: (value: Awaited<ReturnType<typeof getAuditLogsAction>>) => void;
    const old = new Promise<Awaited<ReturnType<typeof getAuditLogsAction>>>((resolve, reject) => { resolveOld = resolve; rejectOld = reject; });
    const latest = new Promise<Awaited<ReturnType<typeof getAuditLogsAction>>>((resolve) => { resolveLatest = resolve; });
    vi.mocked(getAuditLogsAction).mockReturnValueOnce(old).mockReturnValueOnce(latest);
    render(<AuditConsolePage />);
    fireEvent.change(screen.getByLabelText("Filtrar por ID del operador"), { target: { value: "102" } });
    await act(async () => {
      if (outcome === "rejection") rejectOld(new Error("stale failure"));
      else resolveOld(outcome === "forbidden"
        ? { success: false, error: "stale forbidden", isForbidden: true }
        : { success: true, data: page([]) });
    });
    expect(screen.getByLabelText("Cargando bitácora de auditoría...")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(async () => { resolveLatest({ success: true, data: page([]) }); });
    expect(screen.queryByLabelText("Cargando bitácora de auditoría...")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps the latest result when the previous search resolves last", async () => {
    let resolveOld!: (value: Awaited<ReturnType<typeof getAuditLogsAction>>) => void;
    let resolveLatest!: (value: Awaited<ReturnType<typeof getAuditLogsAction>>) => void;
    vi.mocked(getAuditLogsAction)
      .mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveLatest = resolve; }));
    render(<AuditConsolePage />);
    fireEvent.change(screen.getByLabelText("Filtrar por ID del operador"), { target: { value: "102" } });
    await act(async () => { resolveLatest({ success: false, error: "latest error" }); });
    await act(async () => { resolveOld({ success: true, data: page([]) }); });
    expect(screen.getByRole("alert")).toHaveTextContent("latest error");
  });

  it("ignores rejection from an unmounted request", async () => {
    let rejectRequest!: (error: Error) => void;
    vi.mocked(getAuditLogsAction).mockReturnValueOnce(new Promise((_, reject) => { rejectRequest = reject; }));
    const { unmount } = render(<AuditConsolePage />);
    unmount();
    await act(async () => { rejectRequest(new Error("late rejection")); });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders loading skeleton and displays API event values", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({ success: true, data: page() });

    render(<AuditConsolePage />);

    expect(screen.getByLabelText("Cargando bitácora de auditoría...")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("101")).toBeInTheDocument());
    expect(screen.getByText("Contratación #105")).toBeInTheDocument();
    const table = within(screen.getByRole("table"));
    expect(table.getByText("Acceso")).toBeInTheDocument();
    expect(table.getByText("Exitoso")).toBeInTheDocument();
  });

  it("displays forbidden message when user lacks permissions", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({
      success: false,
      error: "No posees permisos suficientes para acceder a la consola de auditoría.",
      isForbidden: true,
    });

    render(<AuditConsolePage />);
    await waitFor(() => {
      expect(screen.getByText("No posees permisos suficientes para acceder a la consola de auditoría.")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
  });

  it("displays error message and allows retry", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValueOnce({
      success: false,
      error: "Ocurrió un error al cargar la bitácora de auditoría.",
    });
    render(<AuditConsolePage />);
    await waitFor(() => expect(screen.getByText("Ocurrió un error al cargar la bitácora de auditoría.")).toBeInTheDocument());

    vi.mocked(getAuditLogsAction).mockResolvedValueOnce({ success: true, data: page() });
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => expect(screen.getByText("101")).toBeInTheDocument());
  });

  it("renders action and numeric operator filters", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({ success: true, data: page() });
    render(<AuditConsolePage />);

    await waitFor(() => expect(screen.getByText("101")).toBeInTheDocument());
    expect(screen.getByLabelText("Filtrar por acción")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por ID del operador")).toHaveAttribute("type", "number");
  });

  it("passes date range filters to getAuditLogsAction", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({ success: true, data: page() });
    render(<AuditConsolePage initialFilters={{ from: "2026-09-01", to: "2026-09-20" }} />);

    await waitFor(() => {
      expect(getAuditLogsAction).toHaveBeenCalledWith({ from: "2026-09-01", to: "2026-09-20" });
    });
  });

  it("loads and appends the next cursor page", async () => {
    const nextEntry: AuditLogEntry = {
      ...mockEntries[0],
      id: "018f3f3a-8e75-7bc4-9a50-8f512998d111",
      operatorId: 102,
      result: "prepared",
      correlationId: "trace-002",
    };
    vi.mocked(getAuditLogsAction)
      .mockResolvedValueOnce({ success: true, data: page(mockEntries, "opaque-cursor") })
      .mockResolvedValueOnce({ success: true, data: page([nextEntry]) });

    render(<AuditConsolePage />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Cargar más" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Cargar más" }).click();

    await waitFor(() => expect(screen.getByText("102")).toBeInTheDocument());
    expect(getAuditLogsAction).toHaveBeenLastCalledWith({}, "opaque-cursor");
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Cargar más" })).not.toBeInTheDocument();
  });

  it("opens details with the API correlation identifier", async () => {
    vi.mocked(getAuditLogsAction).mockResolvedValue({ success: true, data: page() });
    render(<AuditConsolePage />);

    await waitFor(() => expect(screen.getByText("101")).toBeInTheDocument());
    screen.getByText("101").closest("tr")!.click();

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Detalle de intervención")).toBeInTheDocument();
      expect(screen.getByText("trace-001")).toBeInTheDocument();
      expect(screen.queryByText(/IP|Agente de usuario/)).not.toBeInTheDocument();
    });
  });
});
