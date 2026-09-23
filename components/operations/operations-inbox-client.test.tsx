import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OperationsInboxClient } from "./operations-inbox-client";
import * as actions from "@/app/(dashboard)/operaciones/actions";
import type { OperationSummary } from "@/domain/operations/operation-summary";

vi.mock("@/app/(dashboard)/operaciones/actions", () => ({
  getOperationsAction: vi.fn(),
}));

vi.mock("@/app/(dashboard)/rubros/actions", () => ({
  getCategoriesAction: vi.fn().mockResolvedValue({
    success: true,
    data: [
      { id: 1, name: "Plomería" },
      { id: 2, name: "Electricidad" },
    ],
  }),
}));

const mockOperations: OperationSummary[] = [
  {
    id: "op-1",
    jobRequestId: 101,
    serviceProposalId: 201,
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
];

describe("OperationsInboxClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders operations table and filter bar when data loads successfully", async () => {
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: mockOperations,
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    expect(screen.getByRole("combobox", { name: "Alerta Operativa" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Rubro" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar participante" })).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  it("filters operations when bottleneck alert changes", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: mockOperations,
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" });
    await user.selectOptions(select, "stalled");

    expect(actions.getOperationsAction).toHaveBeenCalledWith(
      expect.objectContaining({ bottleneck: "stalled" }),
    );
  });

  it("filters operations when category changes", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: mockOperations,
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: "Rubro" });
    await user.selectOptions(select, "1");

    expect(actions.getOperationsAction).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 1 }),
    );
  });

  it("filters operations when search query is entered", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: mockOperations,
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const input = screen.getByRole("searchbox", { name: "Buscar participante" });
    await user.type(input, "Pérez");

    expect(actions.getOperationsAction).toHaveBeenCalledWith(
      expect.objectContaining({ q: "Pérez" }),
    );
  });

  it("renders empty state when no operations match", async () => {
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByTestId("operations-empty-state")).toBeInTheDocument();
    });

    expect(screen.getByRole("combobox", { name: "Alerta Operativa" })).toBeInTheDocument();
  });

  it("renders restricted access alert without retry button when isForbidden is true", async () => {
    vi.mocked(actions.getOperationsAction).mockResolvedValue({
      success: false,
      error: "No tiene permisos para supervisar operaciones.",
      isForbidden: true,
    });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/permisos|restringido/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it("renders error alert with retry button and retries loading when clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.getOperationsAction)
      .mockResolvedValueOnce({
        success: false,
        error: "Ocurrió un error al cargar las operaciones. Por favor intente nuevamente.",
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockOperations,
      });

    render(<OperationsInboxClient />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });
});


