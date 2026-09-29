import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClaimDetails } from "@/domain/claims/claim";
import { getClaimDetailsAction } from "@/app/(dashboard)/reclamos/actions";
import { ClaimDetailClient } from "./claim-detail-client";

vi.mock("@/app/(dashboard)/reclamos/actions", () => ({
  getClaimDetailsAction: vi.fn(),
}));

describe("ClaimDetailClient", () => {
  const mockClaim: ClaimDetails = {
    id: "clm-101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: 42,
    claimantType: "consumer",
    claimantName: "Ana Gómez",
    respondentName: "Carlos López",
    categoryName: "Plomería",
    status: "in_review",
    urgency: "high",
    claimReason: "Incumplimiento de horario y cobro indebido",
    description: "El prestador se presentó tarde.",
    evidencePhotoUrls: ["https://example.com/p1.jpg"],
    resolution: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially and then displays claim detail view", async () => {
    vi.mocked(getClaimDetailsAction).mockResolvedValueOnce({
      success: true,
      data: mockClaim,
    });

    render(<ClaimDetailClient id="clm-101" />);

    expect(screen.getByTestId("claim-detail-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/clm-101/)).toBeInTheDocument();
      expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
      expect(screen.getByTestId("claim-description")).toHaveTextContent(
        "El prestador se presentó tarde.",
      );
    });
  });

  it("renders forbidden alert when user lacks permissions", async () => {
    vi.mocked(getClaimDetailsAction).mockResolvedValueOnce({
      success: false,
      error: "No posees permisos suficientes para gestionar reclamos.",
      isForbidden: true,
    });

    render(<ClaimDetailClient id="clm-101" />);

    await waitFor(() => {
      expect(
        screen.getByText("No posees permisos suficientes para gestionar reclamos."),
      ).toBeInTheDocument();
    });
  });

  it("renders not found alert when claim does not exist", async () => {
    vi.mocked(getClaimDetailsAction).mockResolvedValueOnce({
      success: false,
      error: "No se encontró el reclamo solicitado.",
      isNotFound: true,
    });

    render(<ClaimDetailClient id="clm-999" />);

    await waitFor(() => {
      expect(screen.getByText("No se encontró el reclamo solicitado.")).toBeInTheDocument();
    });
  });

  it("renders error alert with retry button when action fails", async () => {
    vi.mocked(getClaimDetailsAction).mockResolvedValueOnce({
      success: false,
      error: "Ocurrió un error al cargar el expediente del reclamo.",
    });

    render(<ClaimDetailClient id="clm-101" />);

    await waitFor(() => {
      expect(
        screen.getByText("Ocurrió un error al cargar el expediente del reclamo."),
      ).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    expect(retryButton).toBeInTheDocument();

    vi.mocked(getClaimDetailsAction).mockResolvedValueOnce({
      success: true,
      data: mockClaim,
    });

    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(/clm-101/)).toBeInTheDocument();
    });
  });
});
