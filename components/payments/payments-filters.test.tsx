import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaymentsFilters, type PaymentsFiltersProps } from "./payments-filters";

function createProps(overrides: Partial<PaymentsFiltersProps> = {}): PaymentsFiltersProps {
  return {
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

describe("PaymentsFilters", () => {
  it("provides API filter fields and an accessible search input", () => {
    render(<PaymentsFilters {...createProps()} />);

    expect(screen.getByRole("combobox", { name: "Buscar por" })).toHaveValue("paymentIntentId");
    expect(screen.getByRole("option", { name: "ID de intención" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Referencia externa" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar pagos" })).toBeInTheDocument();
  });

  it("forwards search field, text, and submit interactions", async () => {
    const onSearchFieldChange = vi.fn();
    const onSearchChange = vi.fn();
    const onSearchSubmit = vi.fn();
    const user = userEvent.setup();
    render(<PaymentsFilters {...createProps({ onSearchFieldChange, onSearchChange, onSearchSubmit })} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Buscar por" }), "externalPaymentId");
    await user.type(screen.getByRole("searchbox", { name: "Buscar pagos" }), "pay_1001");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearchFieldChange).toHaveBeenCalledWith("externalPaymentId");
    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders purpose options from the API purpose enum", () => {
    render(<PaymentsFilters {...createProps({ selectedPurpose: "booking_deposit" })} />);

    const select = screen.getByRole("combobox", { name: "Filtrar por propósito" });
    expect(select).toHaveValue("booking_deposit");
    expect(screen.getByRole("option", { name: "Todos los propósitos" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Seña" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Saldo del servicio" })).toBeInTheDocument();
  });

  it("forwards the selected purpose", async () => {
    const onPurposeChange = vi.fn();
    const user = userEvent.setup();
    render(<PaymentsFilters {...createProps({ onPurposeChange })} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por propósito" }), "service_balance");
    expect(onPurposeChange).toHaveBeenCalledWith("service_balance");
  });

  it("renders intent statuses and forwards the selected status", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    render(<PaymentsFilters {...createProps({ selectedStatus: "paid", onStatusChange })} />);

    const select = screen.getByRole("combobox", { name: "Filtrar por estado" });
    expect(select).toHaveValue("paid");
    expect(screen.getByRole("option", { name: "Pagado" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "En proceso" })).toBeInTheDocument();
    await user.selectOptions(select, "processing");
    expect(onStatusChange).toHaveBeenCalledWith("processing");
  });
});
