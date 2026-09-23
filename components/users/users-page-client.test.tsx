import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as actions from "@/app/(dashboard)/usuarios/actions";
import { UsersPageClient } from "./users-page-client";

vi.mock("@/app/(dashboard)/usuarios/actions", () => ({
  getConsumersAction: vi.fn(),
  getProvidersAction: vi.fn(),
}));


describe("UsersPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads consumers on mount and displays them in ConsumersView", async () => {
    vi.mocked(actions.getConsumersAction).mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: "Ana",
          surname: "Pérez",
          email: "ana@example.com",
          createdOn: "2026-09-10",
        },
      ],
    });

    render(<UsersPageClient />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando consumidores...");

    await waitFor(() => {
      expect(screen.getByText("Ana")).toBeInTheDocument();
      expect(screen.getByText("Pérez")).toBeInTheDocument();
    });
  });

  it("handles search input change and calls getConsumersAction with query", async () => {
    vi.mocked(actions.getConsumersAction).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<UsersPageClient />);

    const searchInput = screen.getByLabelText("Buscar consumidores");
    await userEvent.type(searchInput, "perez");

    await waitFor(() => {
      expect(actions.getConsumersAction).toHaveBeenCalledWith("perez");
    });
  });

  it("handles forbidden error by showing forbidden message", async () => {
    vi.mocked(actions.getConsumersAction).mockResolvedValue({
      success: false,
      error: "Acceso restringido",
      isForbidden: true,
    });

    render(<UsersPageClient />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Acceso restringido");
    });
  });

  it("switches to providers tab and loads providers", async () => {
    vi.mocked(actions.getConsumersAction).mockResolvedValue({
      success: true,
      data: [],
    });
    vi.mocked(actions.getProvidersAction).mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: "Juan",
          surname: "Gómez",
          email: "juan@example.com",
          createdOn: "2026-09-10",
          category: { id: 10, name: "Plomería" },
          coverageZones: [{ id: 1, name: "Comuna 6", code: "comuna_6" }],
          identityVerificationStatus: "approved",
        },
      ],
    });

    render(<UsersPageClient />);

    const providersTab = screen.getByRole("tab", { name: "Prestadores" });
    await userEvent.click(providersTab);

    await waitFor(() => {
      expect(actions.getProvidersAction).toHaveBeenCalled();
      const table = screen.getByRole("table");
      expect(within(table).getByText("Juan")).toBeInTheDocument();
      expect(within(table).getByText("Gómez")).toBeInTheDocument();
      expect(within(table).getByText("Plomería")).toBeInTheDocument();
    });
  });

  it("displays forbidden alert when getProvidersAction returns forbidden", async () => {
    vi.mocked(actions.getConsumersAction).mockResolvedValue({
      success: true,
      data: [],
    });
    vi.mocked(actions.getProvidersAction).mockResolvedValue({
      success: false,
      error: "Acceso restringido: no tenés permisos para consultar el directorio de prestadores",
      isForbidden: true,
    });

    render(<UsersPageClient />);

    const providersTab = screen.getByRole("tab", { name: "Prestadores" });
    await userEvent.click(providersTab);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Acceso restringido: no tenés permisos");
    });
  });

  it("displays error alert and retries when clicking retry button in providers tab", async () => {
    vi.mocked(actions.getConsumersAction).mockResolvedValue({
      success: true,
      data: [],
    });
    vi.mocked(actions.getProvidersAction)
      .mockResolvedValueOnce({
        success: false,
        error: "No se pudieron obtener los prestadores. Intentá nuevamente más tarde",
      })
      .mockResolvedValueOnce({
        success: true,
        data: [],
      });

    render(<UsersPageClient />);

    const providersTab = screen.getByRole("tab", { name: "Prestadores" });
    await userEvent.click(providersTab);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("No se pudieron obtener los prestadores");
    });

    const retryBtn = screen.getByRole("button", { name: "Reintentar" });
    await userEvent.click(retryBtn);

    await waitFor(() => {
      expect(actions.getProvidersAction).toHaveBeenCalledTimes(2);
    });
  });
});

