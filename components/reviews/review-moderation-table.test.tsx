import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/lib/routes";
import { ReviewModerationTable, type ReviewModerationItem } from "./review-moderation-table";

const mockReviews: ReviewModerationItem[] = [
  {
    id: "101",
    consumerId: 10,
    consumerName: "Ana Pérez",
    providerId: 20,
    providerName: "José García",
    operationId: "work_order-101",
    rating: 1,
    visibility: "visible", version: 3, pendingReportCount: 1,
    reportedOn: "2026-09-25T14:00:00Z",
  },
  {
    id: "102", consumerId: 11, providerId: 21, operationId: "work_order-102", rating: 2,
    visibility: "hidden", version: 4, pendingReportCount: 0,
    reportedOn: "2026-09-24T18:30:00Z",
  },
  {
    id: "103", consumerId: 12, providerId: 22, operationId: "work_order-103", rating: 5,
    visibility: "visible", version: 1, pendingReportCount: 0,
    reportedOn: null,
  },
];

describe("ReviewModerationTable", () => {
  it("renders only the summary fields available from the API", () => {
    render(<ReviewModerationTable reviews={mockReviews} />);

    expect(screen.getByRole("table", { name: "Listado de reseñas para moderación" })).toBeInTheDocument();
    for (const heading of ["Consumidor", "Prestador", "Contratación", "Calificación", "Reportes pendientes", "Visibilidad", "Fecha", "Acciones"]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }

    const reportedRow = screen.getByText("work_order-101").closest("tr")!;
    expect(within(reportedRow).getByRole("link", { name: "Ana Pérez" })).toHaveAttribute("href", ROUTES.consumerDetail(10));
    expect(within(reportedRow).getByRole("link", { name: "José García" })).toHaveAttribute("href", ROUTES.providerDetail(20));
    expect(within(reportedRow).getByText("ID: 10")).toBeInTheDocument();
    expect(within(reportedRow).getByText("ID: 20")).toBeInTheDocument();
    expect(within(reportedRow).getAllByText("1")).toHaveLength(2);
    expect(within(reportedRow).getByText("Visible")).toBeInTheDocument();
    expect(within(reportedRow).getByText("25/09/2026")).toBeInTheDocument();

    const hiddenRow = screen.getByText("work_order-102").closest("tr")!;
    expect(within(hiddenRow).getByRole("link", { name: "11" })).toHaveAttribute("href", ROUTES.consumerDetail(11));
    expect(within(hiddenRow).getByRole("link", { name: "21" })).toHaveAttribute("href", ROUTES.providerDetail(21));
    expect(within(hiddenRow).getByText("Ocultada")).toBeInTheDocument();
    expect(within(hiddenRow).getByText("Restablecer visibilidad")).toBeInTheDocument();

    const visibleRow = screen.getByText("work_order-103").closest("tr")!;
    expect(within(visibleRow).getByText("Visible")).toBeInTheDocument();
    expect(within(visibleRow).getByText("—")).toBeInTheDocument();
  });

  it("renders empty state when no reviews exist", () => {
    render(<ReviewModerationTable reviews={[]} />);
    expect(screen.getByText("No hay reseñas para moderar en este momento")).toBeInTheDocument();
  });

  it("renders custom empty message when provided", () => {
    render(<ReviewModerationTable reviews={[]} emptyMessage="No se encontraron reseñas filtradas" />);
    expect(screen.getByText("No se encontraron reseñas filtradas")).toBeInTheDocument();
  });

  it("calls onSelectReview when clicking a row or pressing Enter", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    render(<ReviewModerationTable reviews={mockReviews} onSelectReview={handleSelect} />);

    const reportedRow = screen.getByText("work_order-101").closest("tr")!;
    await user.click(reportedRow);
    expect(handleSelect).toHaveBeenLastCalledWith(mockReviews[0]);

    const hiddenRow = screen.getByText("work_order-102").closest("tr")!;
    hiddenRow.focus();
    await user.keyboard("{Enter}");
    expect(handleSelect).toHaveBeenLastCalledWith(mockReviews[1]);
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it("keeps profile link click and keyboard events from selecting the review row", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    render(<ReviewModerationTable reviews={mockReviews} onSelectReview={handleSelect} />);

    const profileLink = screen.getByRole("link", { name: "Ana Pérez" });
    await user.click(profileLink);
    fireEvent.keyDown(profileLink, { key: "Enter" });
    fireEvent.keyDown(profileLink, { key: " " });

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("calls the hide and restore handlers from the row actions", async () => {
    const handleHide = vi.fn();
    const handleRestore = vi.fn();
    const user = userEvent.setup();
    render(<ReviewModerationTable reviews={mockReviews} onHideReview={handleHide} onRestoreReview={handleRestore} />);

    const reportedRow = screen.getByText("work_order-101").closest("tr")!;
    await user.click(within(reportedRow).getByRole("button", { name: "Ocultar reseña" }));
    expect(handleHide).toHaveBeenCalledWith(mockReviews[0]);

    const hiddenRow = screen.getByText("work_order-102").closest("tr")!;
    await user.click(within(hiddenRow).getByRole("button", { name: "Restablecer visibilidad" }));
    expect(handleRestore).toHaveBeenCalledWith(mockReviews[1]);
  });

  it("opens a review detail without invoking a moderation action", async () => {
    const handleView = vi.fn();
    const handleHide = vi.fn();
    const user = userEvent.setup();
    render(
      <ReviewModerationTable
        reviews={mockReviews}
        onViewReview={handleView}
        onHideReview={handleHide}
      />,
    );

    const row = screen.getByText("work_order-101").closest("tr")!;
    await user.click(within(row).getByRole("button", { name: "Ver detalle" }));

    expect(handleView).toHaveBeenCalledWith(mockReviews[0]);
    expect(handleHide).not.toHaveBeenCalled();
  });
});
