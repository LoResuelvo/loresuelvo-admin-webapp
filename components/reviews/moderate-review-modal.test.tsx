import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModerateReviewModal } from "./moderate-review-modal";
import type { ReviewModerationItem } from "@/domain/reviews/review-moderation";
import { translations } from "@/infrastructure/i18n/translations";

const mockReview: ReviewModerationItem = {
  id: "rev-101",
  createdAt: "2026-09-25T14:00:00Z",
  operationId: 101,
  authorName: "Lucía Fernández",
  providerName: "Roberto Gómez",
  rating: 1,
  comment: "El trabajo fue pésimo y además me insultó al retirarse.",
  status: "reported",
  reportReason: "Lenguaje agraviante y trato ofensivo",
  moderation: null,
};

describe("ModerateReviewModal", () => {
  const copy = translations.moderation;

  it("does not render when isOpen is false", () => {
    render(
      <ModerateReviewModal
        isOpen={false}
        onClose={vi.fn()}
        review={mockReview}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders form elements and review details when isOpen is true", () => {
    render(
      <ModerateReviewModal
        isOpen={true}
        onClose={vi.fn()}
        review={mockReview}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: copy.modal.title })).toBeInTheDocument();
    expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    expect(screen.getByLabelText(copy.modal.categoryLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.modal.reasonLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.modal.cancel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.modal.confirm })).toBeInTheDocument();
  });

  it("shows validation error and prevents submission when category is missing", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <ModerateReviewModal
        isOpen={true}
        onClose={vi.fn()}
        review={mockReview}
        onSubmit={handleSubmit}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: copy.modal.confirm });
    await user.click(submitBtn);

    expect(screen.getByRole("alert")).toHaveTextContent(copy.modal.errors.categoryRequired);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with selected category and reason", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <ModerateReviewModal
        isOpen={true}
        onClose={vi.fn()}
        review={mockReview}
        onSubmit={handleSubmit}
      />,
    );

    const select = screen.getByLabelText(copy.modal.categoryLabel);
    await user.selectOptions(select, "abusive_language");

    const reasonTextarea = screen.getByLabelText(copy.modal.reasonLabel);
    await user.type(reasonTextarea, "Lenguaje ofensivo hacia el prestador");

    const submitBtn = screen.getByRole("button", { name: copy.modal.confirm });
    await user.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      category: "abusive_language",
      reason: "Lenguaje ofensivo hacia el prestador",
    });
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <ModerateReviewModal
        isOpen={true}
        onClose={handleClose}
        review={mockReview}
        onSubmit={vi.fn()}
      />,
    );

    const cancelBtn = screen.getByRole("button", { name: copy.modal.cancel });
    await user.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });

  it("displays server error alert when error prop is provided", () => {
    render(
      <ModerateReviewModal
        isOpen={true}
        onClose={vi.fn()}
        review={mockReview}
        onSubmit={vi.fn()}
        error="Fallo al conectar con el servidor"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Fallo al conectar con el servidor");
  });

  it("disables buttons and inputs when isSubmitting is true", () => {
    render(
      <ModerateReviewModal
        isOpen={true}
        onClose={vi.fn()}
        review={mockReview}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />,
    );

    expect(screen.getByRole("button", { name: copy.modal.submitting })).toBeDisabled();
    expect(screen.getByRole("button", { name: copy.modal.cancel })).toBeDisabled();
    expect(screen.getByLabelText(copy.modal.categoryLabel)).toBeDisabled();
    expect(screen.getByLabelText(copy.modal.reasonLabel)).toBeDisabled();
  });

  it("renders a retry button when error is provided and retries on click", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(
      <ModerateReviewModal
        isOpen={true}
        onClose={vi.fn()}
        review={mockReview}
        onSubmit={handleSubmit}
        error="Fallo al conectar con el servidor"
      />,
    );

    const retryButton = screen.getByRole("button", { name: copy.retry });
    expect(retryButton).toBeInTheDocument();

    const select = screen.getByLabelText(copy.modal.categoryLabel);
    await user.selectOptions(select, "abusive_language");
    await user.click(retryButton);

    expect(handleSubmit).toHaveBeenCalled();
  });
});

