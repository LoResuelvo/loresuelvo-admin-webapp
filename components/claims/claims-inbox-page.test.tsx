import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockClaims = [
  {
    id: "clm-101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: 42,
    claimantType: "consumer" as const,
    claimantName: "Ana Gómez",
    respondentName: "Carlos López",
    categoryName: "Plomería",
    status: "in_review" as const,
    urgency: "high" as const,
  },
];

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
      expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
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
      expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
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
});
