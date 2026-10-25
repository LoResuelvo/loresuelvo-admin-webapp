import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockClaims = {
  items: [{
    id: "101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: "sp-42",
    claimantType: "consumer" as const,
    claimantName: "ana@example.com",
    categoryName: "Plomería",
    status: "in_review" as const,
  }],
  page: 1,
  limit: 20,
  total: 1,
};

vi.mock("@/app/(dashboard)/reclamos/actions", () => ({
  getClaimsAction: vi.fn(),
}));

import { getClaimsAction } from "@/app/(dashboard)/reclamos/actions";
import { ClaimsInboxPage } from "./claims-inbox-page";

describe("ClaimsInboxPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton initially and claims table when data resolves", async () => {
    vi.mocked(getClaimsAction).mockResolvedValue({
      success: true,
      data: mockClaims,
    });

    render(<ClaimsInboxPage />);

    expect(screen.getByLabelText("Cargando reclamos")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    });

    expect(screen.queryByLabelText("Cargando reclamos")).not.toBeInTheDocument();
  });

  it("renders error alert and retries when clicking retry", async () => {
    const user = userEvent.setup();
    vi.mocked(getClaimsAction)
      .mockResolvedValueOnce({
        success: false,
        error: "Fallo temporal de conexión",
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockClaims,
      });

    render(<ClaimsInboxPage />);

    await waitFor(() => {
      expect(screen.getByText("Fallo temporal de conexión")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    });
  });

  it("renders forbidden alert when user lacks permission", async () => {
    vi.mocked(getClaimsAction).mockResolvedValue({
      success: false,
      error: "No posees permisos suficientes para gestionar reclamos.",
      isForbidden: true,
    });

    render(<ClaimsInboxPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No posees permisos suficientes para gestionar reclamos."),
      ).toBeInTheDocument();
    });
  });

  it("reloads claims when status filter or search changes", async () => {
    const user = userEvent.setup();
    vi.mocked(getClaimsAction).mockResolvedValue({
      success: true,
      data: mockClaims,
    });

    render(<ClaimsInboxPage />);

    await waitFor(() => {
      expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole("combobox", { name: "Filtrar por estado" });
    await user.selectOptions(statusSelect, "open");

    await waitFor(() => {
      expect(getClaimsAction).toHaveBeenCalledWith({ status: "open", q: "", page: 1 });
    });
  });

  it("requests the next API page and reports pagination metadata", async () => {
    const user = userEvent.setup();
    vi.mocked(getClaimsAction)
      .mockResolvedValueOnce({
        success: true,
        data: { ...mockClaims, total: 25 },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { ...mockClaims, page: 2, total: 25, items: [{ ...mockClaims.items[0], id: "102" }] },
      });

    render(<ClaimsInboxPage />);

    expect(await screen.findByText("Página 1 / 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Página siguiente" }));

    await waitFor(() => {
      expect(getClaimsAction).toHaveBeenLastCalledWith({ status: "", q: "", page: 2 });
      expect(screen.getByText("Página 2 / 2")).toBeInTheDocument();
    });
  });
});
