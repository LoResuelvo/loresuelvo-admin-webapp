import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import { getOperationDetailAction } from "@/app/(dashboard)/operaciones/actions";
import { OperationDetailClient } from "./operation-detail-client";

vi.mock("@/app/(dashboard)/operaciones/actions", () => ({
  getOperationDetailAction: vi.fn(),
}));

describe("OperationDetailClient", () => {
  const mockDetail: UnifiedOperationDetail = {
    id: "op-101",
    status: "in_progress",
    createdAt: "2026-09-18T10:00:00Z",
    category: { id: 1, name: "Plomería" },
    consumer: {
      id: 10,
      name: "Ana",
      surname: "Martínez",
      email: "ana@example.com",
      profilePhotoUrl: null,
    },
    provider: {
      id: 20,
      name: "Carlos",
      surname: "López",
      email: "carlos@example.com",
      profilePhotoUrl: null,
    },
    currentAddress: "Av. Corrientes 1234, CABA",
    request: {
      id: 501,
      title: "Reparación de cañería",
      description: "Pérdida en cocina",
      status: "in_progress",
      photos: [],
    },
    proposals: [],
    order: null,
    timeline: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton initially and then displays operation header", async () => {
    vi.mocked(getOperationDetailAction).mockResolvedValueOnce({
      success: true,
      data: mockDetail,
    });

    render(<OperationDetailClient id="op-101" />);

    expect(screen.getByTestId("operation-detail-skeleton")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("operation-header")).toBeInTheDocument();
    });

    expect(screen.getByText("Ana Martínez")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
  });

  it("handles forbidden access error", async () => {
    vi.mocked(getOperationDetailAction).mockResolvedValueOnce({
      success: false,
      error: "Acceso restringido.",
      isForbidden: true,
    });

    render(<OperationDetailClient id="op-101" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("Acceso restringido.")).toBeInTheDocument();
  });

  it("handles not found error", async () => {
    vi.mocked(getOperationDetailAction).mockResolvedValueOnce({
      success: false,
      error: "La contratación solicitada no existe.",
      isNotFound: true,
    });

    render(<OperationDetailClient id="op-999" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("La contratación solicitada no existe.")).toBeInTheDocument();
  });

  it("handles generic error and allows retry", async () => {
    vi.mocked(getOperationDetailAction)
      .mockResolvedValueOnce({
        success: false,
        error: "Error del servidor",
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockDetail,
      });

    render(<OperationDetailClient id="op-101" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("operation-header")).toBeInTheDocument();
    });
  });

  it("renders proposal and order cards when data is present", async () => {
    const detailWithProposalAndOrder: UnifiedOperationDetail = {
      ...mockDetail,
      proposals: [
        {
          id: 201,
          amountCents: 4500000,
          bookingDepositCents: 900000,
          estimatedDuration: "3 días",
          description: "Trabajo cotizado",
          status: "accepted",
          createdAt: "2026-09-19T11:30:00Z",
        },
      ],
      order: {
        id: 301,
        status: "scheduled",
        scheduledFor: "2026-09-25T09:00:00Z",
        completionReport: null,
        review: null,
      },
    };

    vi.mocked(getOperationDetailAction).mockResolvedValueOnce({
      success: true,
      data: detailWithProposalAndOrder,
    });

    render(<OperationDetailClient id="op-101" />);

    await waitFor(() => {
      expect(screen.getByTestId("operation-proposal-card")).toBeInTheDocument();
    });

    expect(screen.getByTestId("operation-order-card")).toBeInTheDocument();
  });

  it("renders completion card when completion report and review are present", async () => {
    const detailWithCompletion: UnifiedOperationDetail = {
      ...mockDetail,
      status: "completed",
      order: {
        id: 301,
        status: "completed",
        scheduledFor: "2026-09-25T09:00:00Z",
        completionReport: {
          completedAt: "2026-09-25T15:30:00Z",
          notes: "Reparación exitosa.",
          photos: ["https://example.com/photo.jpg"],
        },
        review: {
          rating: 5,
          comment: "Gran servicio.",
          createdAt: "2026-09-25T17:00:00Z",
        },
      },
    };

    vi.mocked(getOperationDetailAction).mockResolvedValueOnce({
      success: true,
      data: detailWithCompletion,
    });

    render(<OperationDetailClient id="op-101" />);

    await waitFor(() => {
      expect(screen.getByTestId("operation-completion-card")).toBeInTheDocument();
    });

    expect(screen.getByTestId("operation-review-card")).toBeInTheDocument();
    expect(screen.getByText("Reparación exitosa.")).toBeInTheDocument();
  });
});
