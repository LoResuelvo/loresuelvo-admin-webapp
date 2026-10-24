import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaymentsView, type PaymentsViewProps } from "./payments-view";
import { paymentFixture } from "./payment-test-fixtures";

function createProps(overrides: Partial<PaymentsViewProps> = {}): PaymentsViewProps {
  return {
    items: [paymentFixture()],
    searchField: "paymentIntentId",
    onSearchFieldChange: vi.fn(),
    searchQuery: "",
    onSearchChange: vi.fn(),
    onSearchSubmit: vi.fn(),
    selectedPurpose: "",
    onPurposeChange: vi.fn(),
    selectedStatus: "",
    onStatusChange: vi.fn(),
    ...overrides,
  };
}

describe("PaymentsView", () => {
  it("renders the current payment intent and opens its API-backed details", async () => {
    render(<PaymentsView {...createProps()} />);
    expect(screen.getByRole("heading", { name: "Consola de pagos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cliente #1" })).toBeInTheDocument();
    expect(screen.queryByText("0f8fad5b-d9cb-469f-a165-70867728950e")).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: "Ver desglose y referencias" }));
    const dialog = screen.getByRole("dialog", { name: "Detalle del pago" });
    expect(within(dialog).getByText("0f8fad5b-d9cb-469f-a165-70867728950e")).toBeInTheDocument();
    expect(within(dialog).getByText("ID de propuesta de servicio")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(<PaymentsView {...createProps({ items: [], isLoading: true })} />);
    expect(screen.getByTestId("payments-skeleton")).toBeInTheDocument();
    expect(screen.getByText("Cargando pagos...")).toBeInTheDocument();
  });

  it("renders error message and retry button when error is provided", async () => {
    const onRetry = vi.fn();
    render(<PaymentsView {...createProps({ items: [], error: "Error al cargar pagos", onRetry })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Error al cargar pagos");

    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when the API returns no payments", () => {
    render(<PaymentsView {...createProps({ items: [] })} />);
    expect(screen.getByTestId("payments-empty")).toBeInTheDocument();
    expect(screen.getByText("No hay transacciones disponibles")).toBeInTheDocument();
  });

  it("applies a search through the server-filter action callback", async () => {
    const onSearchSubmit = vi.fn();
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(<PaymentsView {...createProps({ onSearchSubmit, onSearchChange })} />);

    const searchInput = screen.getByRole("searchbox", { name: "Buscar pagos" });
    await user.type(searchInput, "0f8fad5b-d9cb-469f-a165-70867728950e");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
  });

  it("forwards supported purpose and intent status filters", async () => {
    const onPurposeChange = vi.fn();
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    render(<PaymentsView {...createProps({ onPurposeChange, onStatusChange })} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por propósito" }), "booking_deposit");
    await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por estado" }), "paid");

    expect(onPurposeChange).toHaveBeenCalledWith("booking_deposit");
    expect(onStatusChange).toHaveBeenCalledWith("paid");
  });

  it("offers cursor pagination when the API returns a next page", async () => {
    const onLoadMore = vi.fn();
    const user = userEvent.setup();
    render(<PaymentsView {...createProps({ hasNextPage: true, onLoadMore })} />);

    await user.click(screen.getByRole("button", { name: "Cargar más pagos" }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("renders forbidden alert without retry button when isForbidden is true", () => {
    render(<PaymentsView {...createProps({ items: [], isForbidden: true })} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/restringido|permisos/i);
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
  });
});
