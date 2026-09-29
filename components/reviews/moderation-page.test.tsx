import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReviewModerationItem } from "@/domain/reviews/review-moderation";
import { ModerationPage } from "./moderation-page";

vi.mock("@/app/(dashboard)/moderacion/actions", () => ({
  getReviewsAction: vi.fn(),
  moderateReviewAction: vi.fn(),
}));

import {
  getReviewsAction,
  moderateReviewAction,
} from "@/app/(dashboard)/moderacion/actions";

const mockReviews: ReviewModerationItem[] = [
  {
    id: "rev-101",
    createdAt: "2026-09-25T14:00:00Z",
    operationId: 101,
    authorName: "Lucía Fernández",
    providerName: "Roberto Gómez",
    rating: 1,
    comment: "El trabajo fue pésimo.",
    status: "reported",
    reportReason: "Lenguaje agraviante",
    moderation: null,
  },
];

const mockHiddenReviews: ReviewModerationItem[] = [
  {
    id: "rev-203",
    createdAt: "2026-09-23T15:00:00Z",
    operationId: 203,
    authorName: "Lucas Benítez",
    providerName: "Florencia Peña",
    rating: 1,
    comment: "Contenido difamatorio y ofensivo.",
    status: "hidden",
    reportReason: "Lenguaje ofensivo",
    moderation: {
      moderatedBy: "Operador Admin",
      moderatedAt: "2026-09-23T16:00:00Z",
      category: "abusive_language",
      reason: "Uso explícito de agravios",
    },
  },
];

describe("ModerationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays reviews table on mount", async () => {
    vi.mocked(getReviewsAction).mockResolvedValue({
      success: true,
      data: mockReviews,
    });

    render(<ModerationPage />);

    expect(screen.getByTestId("moderation-skeleton")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");

    await waitFor(() => {
      expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    });

    expect(screen.getByText("Roberto Gómez")).toBeInTheDocument();
    expect(screen.getByText("El trabajo fue pésimo.")).toBeInTheDocument();
  });

  it("filters reviews when clicking a status tab", async () => {
    vi.mocked(getReviewsAction).mockResolvedValueOnce({
      success: true,
      data: mockReviews,
    });

    render(<ModerationPage />);

    await waitFor(() => {
      expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    });

    vi.mocked(getReviewsAction).mockResolvedValueOnce({
      success: true,
      data: mockHiddenReviews,
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Ocultadas" }));

    await waitFor(() => {
      expect(screen.getByText("Lucas Benítez")).toBeInTheDocument();
    });

    expect(getReviewsAction).toHaveBeenCalledWith("hidden");
    expect(screen.queryByText("Lucía Fernández")).not.toBeInTheDocument();
  });

  it("displays error and allows retry", async () => {
    vi.mocked(getReviewsAction).mockResolvedValueOnce({
      success: false,
      error: "Error de red al cargar reseñas",
    });

    render(<ModerationPage />);

    await waitFor(() => {
      expect(screen.getByText("Error de red al cargar reseñas")).toBeInTheDocument();
    });

    vi.mocked(getReviewsAction).mockResolvedValueOnce({
      success: true,
      data: mockReviews,
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => {
      expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    });
  });

  it("renders with initial reviews without initial loading skeleton", () => {
    render(<ModerationPage initialReviews={mockReviews} />);

    expect(screen.queryByLabelText("Cargando reseñas")).not.toBeInTheDocument();
    expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
  });

  it("opens modal on hide button click, submits moderation and shows confirmation", async () => {
    vi.mocked(getReviewsAction).mockResolvedValueOnce({
      success: true,
      data: mockReviews,
    });

    const moderatedReview: ReviewModerationItem = {
      ...mockReviews[0],
      status: "hidden",
      moderation: {
        moderatedBy: "Admin",
        moderatedAt: "2026-09-29T12:00:00Z",
        category: "abusive_language",
        reason: "Lenguaje abusivo",
      },
    };

    vi.mocked(moderateReviewAction).mockResolvedValueOnce({
      success: true,
      data: moderatedReview,
    });

    render(<ModerationPage />);

    await waitFor(() => {
      expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const hideBtn = screen.getByRole("button", { name: "Ocultar reseña" });
    await user.click(hideBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const categorySelect = screen.getByLabelText("Categoría de infracción");
    await user.selectOptions(categorySelect, "abusive_language");

    const reasonTextarea = screen.getByLabelText("Motivo detallado");
    await user.type(reasonTextarea, "Lenguaje ofensivo");

    const confirmBtn = within(dialog).getByRole("button", { name: "Ocultar reseña" });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(moderateReviewAction).toHaveBeenCalledWith(
      "rev-101",
      "hide",
      "abusive_language",
      "Lenguaje ofensivo",
    );

    const feedback = screen.getByTestId("moderation-feedback");
    expect(feedback).toHaveTextContent("La reseña ha sido ocultada correctamente");
    expect(screen.getByText("Ocultada")).toBeInTheDocument();
  });

  it("calls moderateReviewAction with unhide when clicking restore button and shows confirmation", async () => {
    const hiddenReview: ReviewModerationItem = {
      ...mockReviews[0],
      status: "hidden",
      moderation: {
        moderatedBy: "Admin",
        moderatedAt: "2026-09-29T12:00:00Z",
        category: "abusive_language",
        reason: "Lenguaje abusivo",
      },
    };

    vi.mocked(getReviewsAction).mockResolvedValueOnce({
      success: true,
      data: [hiddenReview],
    });

    const restoredReview: ReviewModerationItem = {
      ...hiddenReview,
      status: "visible",
      moderation: null,
    };

    vi.mocked(moderateReviewAction).mockResolvedValueOnce({
      success: true,
      data: restoredReview,
    });

    render(<ModerationPage />);

    await waitFor(() => {
      expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const restoreBtn = screen.getByRole("button", { name: "Restablecer visibilidad" });
    await user.click(restoreBtn);

    expect(moderateReviewAction).toHaveBeenCalledWith("rev-101", "unhide");

    await waitFor(() => {
      const feedback = screen.getByTestId("moderation-feedback");
      expect(feedback).toHaveTextContent("La visibilidad de la reseña ha sido restablecida");
    });
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("displays forbidden access message without retry button when access is restricted", async () => {
    vi.mocked(getReviewsAction).mockResolvedValueOnce({
      success: false,
      error: "Ocurrió un error al cargar las reseñas para moderación.",
      isForbidden: true,
    });

    render(<ModerationPage />);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(/acceso restringido|permisos/i);
    });

    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });
});



