import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReviewModerationDetail } from "@/domain/reviews/review-moderation";
import { ROUTES } from "@/lib/routes";
import { ReviewDetailContent } from "./review-detail-content";

const detail: ReviewModerationDetail = {
  review: {
    id: "review-101",
    consumerId: 10,
    consumerName: "Ana Pérez",
    providerId: 20,
    providerName: "José García",
    operationId: "operation-30",
    rating: 1,
    visibility: "hidden",
    version: 2,
    pendingReportCount: 0,
    reportedOn: "2026-09-25T14:00:00Z",
  },
  description: "El comentario completo de la reseña.",
  report: {
    id: 501,
    category: "abusive_language",
    explanation: "El reporte describe lenguaje ofensivo.",
    status: "pending",
    createdOn: "2026-09-24T14:00:00Z",
  },
  decisions: {
    items: [{
      id: 91,
      operatorId: 7,
      action: "hide",
      category: "abusive_language",
      reason: "Se confirmó lenguaje ofensivo.",
      reportId: 501,
      previousHideId: null,
      createdOn: "2026-09-26T14:30:00Z",
    }, {
      id: 92,
      operatorId: 8,
      action: "unhide",
      category: null,
      reason: "La reseña fue revisada nuevamente.",
      reportId: null,
      previousHideId: 91,
      createdOn: "2026-09-27T09:15:00Z",
    }],
    page: 1,
    limit: 20,
    total: 2,
    hasMore: false,
  },
};

describe("ReviewDetailContent", () => {
  it("shows profile names as links, secondary IDs, report, and translated decision history", () => {
    render(<ReviewDetailContent review={detail} />);

    expect(screen.getByText(detail.description)).toBeInTheDocument();
    expect(screen.getByText(detail.report!.explanation)).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ana Pérez" })).toHaveAttribute("href", ROUTES.consumerDetail(10));
    expect(screen.getByRole("link", { name: "José García" })).toHaveAttribute("href", ROUTES.providerDetail(20));
    expect(screen.getByText("ID de consumidor: 10")).toBeInTheDocument();
    expect(screen.getByText("ID de prestador: 20")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "operation-30" })).toHaveAttribute("href", ROUTES.operationDetail("operation-30"));

    const history = screen.getByRole("list", { name: "Historial de moderación" });
    const decisions = within(history).getAllByRole("listitem");
    expect(decisions[0]).toHaveTextContent("Ocultar reseña");
    expect(decisions[0]).toHaveTextContent("26/09/2026");
    expect(decisions[0]).toHaveTextContent("ID de operador: 7");
    expect(decisions[0]).toHaveTextContent("Lenguaje abusivo u ofensivo");
    expect(decisions[1]).toHaveTextContent("Restablecer visibilidad");
    expect(decisions[1]).toHaveTextContent("27/09/2026");
    expect(decisions[1]).toHaveTextContent("ID de operador: 8");
  });

  it("keeps unknown report categories visible as received", () => {
    render(<ReviewDetailContent review={{ ...detail, report: { ...detail.report!, category: "other_reason" } }} />);

    expect(screen.getByText("other_reason")).toBeInTheDocument();
  });

  it("uses the profile IDs as link labels when names are unavailable", () => {
    render(
      <ReviewDetailContent
        review={{ ...detail, review: { ...detail.review, consumerName: undefined, providerName: undefined } }}
      />,
    );

    expect(screen.getByRole("link", { name: "10" })).toHaveAttribute("href", ROUTES.consumerDetail(10));
    expect(screen.getByRole("link", { name: "20" })).toHaveAttribute("href", ROUTES.providerDetail(20));
    expect(screen.getByText("ID de consumidor: 10")).toBeInTheDocument();
    expect(screen.getByText("ID de prestador: 20")).toBeInTheDocument();
  });
});
