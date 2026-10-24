import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModerateReviewModal } from "./moderate-review-modal";
import type { ReviewModerationDetail } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";

const mockReview: ReviewModerationDetail = {
  review: {
    id: "101", consumerId: 10, providerId: 20, operationId: "work_order-101", rating: 1,
    visibility: "visible", version: 3, pendingReportCount: 1,
    reportedOn: "2026-09-25T14:00:00Z",
  },
  description: "El trabajo fue pésimo y además me insultó al retirarse.",
  report: {
    id: 501,
    category: "abusive_language",
    explanation: "Lenguaje agraviante y trato ofensivo",
    status: "pending",
    createdOn: "2026-09-25T14:00:00Z",
  },
  decisions: { items: [], page: 1, limit: 20, total: 0, hasMore: false },
};

describe("ModerateReviewModal", () => {
  const copy = translations.moderation;

  it("does not render when isOpen is false", () => {
    render(<ModerateReviewModal isOpen={false} onClose={vi.fn()} review={mockReview} onSubmit={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the detail returned by the API and the hide form", () => {
    render(<ModerateReviewModal isOpen onClose={vi.fn()} review={mockReview} onSubmit={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: copy.modal.title })).toBeInTheDocument();
    expect(screen.getByText("Consumidor:")).toBeInTheDocument();
    expect(screen.getByText("Prestador:")).toBeInTheDocument();
    expect(screen.getByText("10", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("20", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/El trabajo fue pésimo y además me insultó/)).toBeInTheDocument();
    expect(screen.getByText(mockReview.report!.explanation)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.modal.categoryLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.modal.reasonLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.modal.cancel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.modal.confirm })).toBeInTheDocument();
  });

  it("shows category validation and prevents submission when the category is missing", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<ModerateReviewModal isOpen onClose={vi.fn()} review={mockReview} onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(copy.modal.reasonLabel), "Motivo suficiente");
    await user.click(screen.getByRole("button", { name: copy.modal.confirm }));

    expect(screen.getByRole("alert")).toHaveTextContent(copy.modal.errors.categoryRequired);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("submits a hide with the selected API category and trimmed reason", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<ModerateReviewModal isOpen onClose={vi.fn()} review={mockReview} onSubmit={handleSubmit} />);

    await user.selectOptions(screen.getByLabelText(copy.modal.categoryLabel), "abusive_language");
    await user.type(screen.getByLabelText(copy.modal.reasonLabel), "Lenguaje ofensivo hacia el prestador");
    await user.click(screen.getByRole("button", { name: copy.modal.confirm }));

    expect(handleSubmit).toHaveBeenCalledWith({
      category: "abusive_language",
      reason: "Lenguaje ofensivo hacia el prestador",
    });
  });

  it("requires a reason when restoring visibility and omits category", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<ModerateReviewModal
      isOpen onClose={vi.fn()} review={mockReview} action="unhide" onSubmit={handleSubmit}
    />);

    expect(screen.queryByLabelText(copy.modal.categoryLabel)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.modal.restoreConfirm }));
    expect(screen.getByRole("alert")).toHaveTextContent(copy.modal.errors.reasonRequired);
    await user.type(screen.getByLabelText(copy.modal.reasonLabel), "Restablecimiento solicitado");
    await user.click(screen.getByRole("button", { name: copy.modal.restoreConfirm }));
    expect(handleSubmit).toHaveBeenCalledWith({ reason: "Restablecimiento solicitado", category: undefined });
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<ModerateReviewModal isOpen onClose={handleClose} review={mockReview} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: copy.modal.cancel }));
    expect(handleClose).toHaveBeenCalled();
  });

  it("displays server errors and retries with the current form values", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<ModerateReviewModal
      isOpen onClose={vi.fn()} review={mockReview} onSubmit={handleSubmit} error="Fallo al conectar con el servidor"
    />);

    expect(screen.getByRole("alert")).toHaveTextContent("Fallo al conectar con el servidor");
    await user.selectOptions(screen.getByLabelText(copy.modal.categoryLabel), "abusive_language");
    await user.type(screen.getByLabelText(copy.modal.reasonLabel), "Motivo informado");
    await user.click(screen.getByRole("button", { name: copy.retry }));
    expect(handleSubmit).toHaveBeenCalledWith({ category: "abusive_language", reason: "Motivo informado" });
  });

  it("disables controls while submitting and shows the detail loading state", () => {
    const { rerender } = render(<ModerateReviewModal
      isOpen onClose={vi.fn()} review={mockReview} onSubmit={vi.fn()} isSubmitting
    />);
    expect(screen.getByRole("button", { name: copy.modal.submitting })).toBeDisabled();
    expect(screen.getByRole("button", { name: copy.modal.cancel })).toBeDisabled();
    expect(screen.getByLabelText(copy.modal.categoryLabel)).toBeDisabled();
    expect(screen.getByLabelText(copy.modal.reasonLabel)).toBeDisabled();

    rerender(<ModerateReviewModal isOpen onClose={vi.fn()} review={null} isLoadingDetail onSubmit={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent(copy.modal.loadingDetail);
    expect(screen.getByRole("button", { name: copy.modal.confirm })).toBeDisabled();
  });
});
