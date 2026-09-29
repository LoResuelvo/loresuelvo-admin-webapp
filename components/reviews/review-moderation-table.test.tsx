import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ReviewModerationTable,
  type ReviewModerationItem,
} from "./review-moderation-table";

const mockReviews: ReviewModerationItem[] = [
  {
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
  },
  {
    id: "rev-102",
    createdAt: "2026-09-24T18:30:00Z",
    operationId: 102,
    authorName: "Esteban Morales",
    providerName: "Clara Domínguez",
    rating: 2,
    comment: "Publicó mis datos personales en la respuesta.",
    status: "hidden",
    reportReason: "Divulgación de datos personales",
    moderation: {
      moderatedBy: "Operador Admin",
      moderatedAt: "2026-09-24T19:00:00Z",
      category: "personal_data",
      reason: "Datos privados expuestos",
    },
  },
  {
    id: "rev-103",
    createdAt: "2026-09-23T11:00:00Z",
    operationId: 103,
    authorName: "Marina Silva",
    providerName: "Lucas Vega",
    rating: 5,
    comment: "Excelente servicio y predisposición.",
    status: "visible",
    reportReason: null,
    moderation: null,
  },
];

describe("ReviewModerationTable", () => {
  it("renders table headers and rows with review details", () => {
    render(<ReviewModerationTable reviews={mockReviews} />);

    expect(
      screen.getByRole("table", { name: "Listado de reseñas para moderación" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Autor")).toBeInTheDocument();
    expect(screen.getByText("Prestador calificado")).toBeInTheDocument();
    expect(screen.getByText("Calificación")).toBeInTheDocument();
    expect(screen.getByText("Comentario")).toBeInTheDocument();
    expect(screen.getByText("Motivo del reporte")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();

    const row0 = screen.getByText("Lucía Fernández").closest("tr")!;
    expect(within(row0).getByText("Roberto Gómez")).toBeInTheDocument();
    expect(within(row0).getByText("1")).toBeInTheDocument();
    expect(
      within(row0).getByText("El trabajo fue pésimo y además me insultó al retirarse."),
    ).toBeInTheDocument();
    expect(
      within(row0).getByText("Lenguaje agraviante y trato ofensivo"),
    ).toBeInTheDocument();
    expect(within(row0).getByText("Reportada")).toBeInTheDocument();
    expect(within(row0).getByText("25/09/2026")).toBeInTheDocument();

    const row1 = screen.getByText("Esteban Morales").closest("tr")!;
    expect(within(row1).getByText("Clara Domínguez")).toBeInTheDocument();
    expect(within(row1).getByText("2")).toBeInTheDocument();
    expect(within(row1).getByText("Ocultada")).toBeInTheDocument();

    const row2 = screen.getByText("Marina Silva").closest("tr")!;
    expect(within(row2).getByText("Lucas Vega")).toBeInTheDocument();
    expect(within(row2).getByText("5")).toBeInTheDocument();
    expect(within(row2).getByText("Sin motivo registrado")).toBeInTheDocument();
    expect(within(row2).getByText("Visible")).toBeInTheDocument();
  });

  it("renders empty state when no reviews exist", () => {
    render(<ReviewModerationTable reviews={[]} />);
    expect(
      screen.getByText("No hay reseñas para moderar en este momento"),
    ).toBeInTheDocument();
  });

  it("renders custom empty message when provided", () => {
    render(
      <ReviewModerationTable
        reviews={[]}
        emptyMessage="No se encontraron reseñas filtradas"
      />,
    );
    expect(
      screen.getByText("No se encontraron reseñas filtradas"),
    ).toBeInTheDocument();
  });

  it("calls onSelectReview when clicking a row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ReviewModerationTable
        reviews={mockReviews}
        onSelectReview={handleSelect}
      />,
    );

    const row = screen.getByText("Lucía Fernández").closest("tr")!;
    await user.click(row);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockReviews[0]);
  });

  it("calls onSelectReview when pressing Enter on a focused row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ReviewModerationTable
        reviews={mockReviews}
        onSelectReview={handleSelect}
      />,
    );

    const row = screen.getByText("Esteban Morales").closest("tr")!;
    row.focus();
    await user.keyboard("{Enter}");

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockReviews[1]);
  });

  it("calls onHideReview when clicking the hide button", async () => {
    const handleHide = vi.fn();
    const user = userEvent.setup();

    render(
      <ReviewModerationTable
        reviews={mockReviews}
        onHideReview={handleHide}
      />,
    );

    const row0 = screen.getByText("Lucía Fernández").closest("tr")!;
    const hideBtn = within(row0).getByRole("button", { name: "Ocultar reseña" });
    await user.click(hideBtn);

    expect(handleHide).toHaveBeenCalledTimes(1);
    expect(handleHide).toHaveBeenCalledWith(mockReviews[0]);
  });

  it("calls onRestoreReview when clicking the restore button on hidden review", async () => {
    const handleRestore = vi.fn();
    const user = userEvent.setup();

    render(
      <ReviewModerationTable
        reviews={mockReviews}
        onRestoreReview={handleRestore}
      />,
    );

    const row1 = screen.getByText("Esteban Morales").closest("tr")!;
    const restoreBtn = within(row1).getByRole("button", { name: "Restablecer visibilidad" });
    await user.click(restoreBtn);

    expect(handleRestore).toHaveBeenCalledTimes(1);
    expect(handleRestore).toHaveBeenCalledWith(mockReviews[1]);
  });
});

