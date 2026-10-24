import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
  ReviewModerationDetail,
  ReviewModerationItem,
  ReviewModerationResult,
} from "@/domain/reviews/review-moderation";
import { ModerationPage } from "./moderation-page";

vi.mock("@/app/(dashboard)/moderacion/actions", () => ({
  getReviewsAction: vi.fn(),
  getReviewDetailAction: vi.fn(),
  moderateReviewAction: vi.fn(),
}));

import {
  getReviewDetailAction,
  getReviewsAction,
  moderateReviewAction,
} from "@/app/(dashboard)/moderacion/actions";

const reportedReview: ReviewModerationItem = {
  id: "101", consumerId: 10, providerId: 20, operationId: "work_order-101", rating: 1,
  visibility: "visible", version: 3, pendingReportCount: 1,
  reportedOn: "2026-09-25T14:00:00Z",
};

const hiddenReview: ReviewModerationItem = {
  ...reportedReview,
  visibility: "hidden",
  version: 4,
  pendingReportCount: 0,
  reportedOn: null,
};

function detail(review: ReviewModerationItem, report: ReviewModerationDetail["report"]): ReviewModerationDetail {
  return {
    review,
    description: "El comentario disponible en el detalle de la reseña.",
    report,
    decisions: { items: [], page: 1, limit: 20, total: 0, hasMore: false },
  };
}

const reportedDetail = detail(reportedReview, {
  id: 501,
  category: "abusive_language",
  explanation: "Lenguaje agraviante",
  status: "pending",
  createdOn: "2026-09-25T14:00:00Z",
});

describe("ModerationPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads and displays the API summary table on mount", async () => {
    vi.mocked(getReviewsAction).mockResolvedValue({ success: true, data: [reportedReview] });
    render(<ModerationPage />);

    expect(screen.getByTestId("moderation-skeleton")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    await waitFor(() => expect(screen.getByText("work_order-101")).toBeInTheDocument());
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.queryByText("El comentario disponible en el detalle de la reseña.")).not.toBeInTheDocument();
  });

  it("filters reviews when clicking a status tab", async () => {
    vi.mocked(getReviewsAction)
      .mockResolvedValueOnce({ success: true, data: [reportedReview] })
      .mockResolvedValueOnce({ success: true, data: [hiddenReview] });
    render(<ModerationPage />);
    await waitFor(() => expect(screen.getByText("work_order-101")).toBeInTheDocument());

    await userEvent.setup().click(screen.getByRole("tab", { name: "Ocultadas" }));
    await waitFor(() => expect(screen.getByText("Ocultada")).toBeInTheDocument());
    expect(getReviewsAction).toHaveBeenCalledWith("hidden");
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("displays load errors and allows retry", async () => {
    vi.mocked(getReviewsAction)
      .mockResolvedValueOnce({ success: false, error: "Error de red al cargar reseñas" })
      .mockResolvedValueOnce({ success: true, data: [reportedReview] });
    render(<ModerationPage />);
    await waitFor(() => expect(screen.getByText("Error de red al cargar reseñas")).toBeInTheDocument());

    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(screen.getByText("work_order-101")).toBeInTheDocument());
  });

  it("renders initial API summaries without the loading skeleton", () => {
    render(<ModerationPage initialReviews={[reportedReview]} />);
    expect(screen.queryByLabelText("Cargando reseñas")).not.toBeInTheDocument();
    expect(screen.getByText("work_order-101")).toBeInTheDocument();
  });

  it("loads a report detail and sends a versioned hide command", async () => {
    vi.mocked(getReviewsAction).mockResolvedValue({ success: true, data: [reportedReview] });
    vi.mocked(getReviewDetailAction).mockResolvedValue({ success: true, data: reportedDetail });
    const moderationResult: ReviewModerationResult = { id: "101", visibility: "hidden", version: 4, decisionId: 89 };
    vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: moderationResult });
    render(<ModerationPage />);
    await waitFor(() => expect(screen.getByText("work_order-101")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Ocultar reseña" }));
    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText("Lenguaje agraviante")).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText("Categoría de infracción"), "abusive_language");
    await user.type(screen.getByLabelText("Motivo detallado"), "Lenguaje ofensivo");
    await user.click(within(dialog).getByRole("button", { name: "Ocultar reseña" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(getReviewDetailAction).toHaveBeenCalledWith("101");
    expect(moderateReviewAction).toHaveBeenCalledWith("101", {
      action: "hide",
      category: "abusive_language",
      reason: "Lenguaje ofensivo",
      expectedVersion: 3,
      reportId: 501,
    });
    expect(screen.getByTestId("moderation-feedback")).toHaveTextContent("La reseña ha sido ocultada correctamente");
    expect(screen.getByText("Ocultada")).toBeInTheDocument();
  });

  it("opens a neutral detail view without presenting or submitting a moderation form", async () => {
    const historyDetail = detail(reportedReview, reportedDetail.report);
    historyDetail.decisions.items.push({
      id: 91,
      operatorId: 7,
      action: "hide",
      category: "abusive_language",
      reason: "Se confirmó el reporte.",
      reportId: 501,
      previousHideId: null,
      createdOn: "2026-09-26T14:30:00Z",
    });
    vi.mocked(getReviewsAction).mockResolvedValue({ success: true, data: [reportedReview] });
    vi.mocked(getReviewDetailAction).mockResolvedValue({ success: true, data: historyDetail });
    render(<ModerationPage />);
    await waitFor(() => expect(screen.getByText("work_order-101")).toBeInTheDocument());

    await userEvent.setup().click(screen.getByRole("button", { name: "Ver detalle" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Detalle de la reseña" })).toBeInTheDocument();
    expect(within(dialog).getByText(historyDetail.description)).toBeInTheDocument();
    expect(within(dialog).getByText(historyDetail.report!.explanation)).toBeInTheDocument();
    expect(within(dialog).getByText("7", { exact: true })).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Motivo detallado")).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Ocultar reseña" })).not.toBeInTheDocument();
    expect(moderateReviewAction).not.toHaveBeenCalled();
    await userEvent.setup().keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Ver detalle" })).toHaveFocus();
  });

  it("asks for a reason before restoring a hidden review", async () => {
    vi.mocked(getReviewsAction).mockResolvedValue({ success: true, data: [hiddenReview] });
    vi.mocked(getReviewDetailAction).mockResolvedValue({
      success: true,
      data: detail(hiddenReview, null),
    });
    const moderationResult: ReviewModerationResult = { id: "101", visibility: "visible", version: 5, decisionId: 90 };
    vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: moderationResult });
    render(<ModerationPage />);
    await waitFor(() => expect(screen.getByText("work_order-101")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Restablecer visibilidad" }));
    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText("Historial de moderación")).toBeInTheDocument());
    await user.type(screen.getByLabelText("Motivo detallado"), "Restablecimiento solicitado");
    await user.click(within(dialog).getByRole("button", { name: "Restablecer visibilidad" }));

    await waitFor(() => expect(moderateReviewAction).toHaveBeenCalledWith("101", {
      action: "unhide",
      reason: "Restablecimiento solicitado",
      expectedVersion: 4,
    }));
    expect(await screen.findByTestId("moderation-feedback")).toHaveTextContent("La visibilidad de la reseña ha sido restablecida");
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("displays forbidden access without retry when review access is restricted", async () => {
    vi.mocked(getReviewsAction).mockResolvedValue({
      success: false,
      error: "Ocurrió un error al cargar las reseñas para moderación.",
      isForbidden: true,
    });
    render(<ModerationPage />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/acceso restringido|permisos/i));
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });
});
