import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReviewModerationItem } from "@/domain/reviews/review-moderation";
import { ModerationPage } from "./moderation-page";

vi.mock("@/app/(dashboard)/moderacion/actions", () => ({
  getReviewsAction: vi.fn(),
}));

import { getReviewsAction } from "@/app/(dashboard)/moderacion/actions";

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

    expect(screen.getByLabelText("Cargando reseñas")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
    });

    expect(screen.getByText("Roberto Gómez")).toBeInTheDocument();
    expect(screen.getByText("El trabajo fue pésimo.")).toBeInTheDocument();
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

  it("renders with initial reviews without loading state", () => {
    render(<ModerationPage initialReviews={mockReviews} />);

    expect(screen.queryByLabelText("Cargando reseñas")).not.toBeInTheDocument();
    expect(screen.getByText("Lucía Fernández")).toBeInTheDocument();
  });
});
