import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaymentsFilters } from "./payments-filters";

describe("PaymentsFilters", () => {
  it("renders search input with accessible label and placeholder", () => {
    render(<PaymentsFilters />);

    const input = screen.getByRole("searchbox", {
      name: "Buscar por referencia o participante",
    });
    expect(input).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por referencia o participante..."),
    ).toBeInTheDocument();
  });

  it("reflects the searchQuery prop value", () => {
    render(<PaymentsFilters searchQuery="MP-REF-45892" />);

    const input = screen.getByRole("searchbox", {
      name: "Buscar por referencia o participante",
    });
    expect(input).toHaveValue("MP-REF-45892");
  });

  it("calls onSearchChange when typing in the search input", async () => {
    const user = userEvent.setup();
    const handleSearchChange = vi.fn();
    render(<PaymentsFilters onSearchChange={handleSearchChange} />);

    const input = screen.getByRole("searchbox", {
      name: "Buscar por referencia o participante",
    });
    await user.type(input, "test");

    expect(handleSearchChange).toHaveBeenCalled();
  });

  it("renders purpose select with options and reflects selectedPurpose", () => {
    render(<PaymentsFilters selectedPurpose="deposit" />);

    const select = screen.getByRole("combobox", {
      name: "Filtrar por propósito",
    }) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("deposit");
    expect(screen.getByRole("option", { name: "Todos los propósitos" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Seña" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Saldo" })).toBeInTheDocument();
  });

  it("calls onPurposeChange when selecting a purpose", async () => {
    const user = userEvent.setup();
    const handlePurposeChange = vi.fn();
    render(<PaymentsFilters onPurposeChange={handlePurposeChange} />);

    const select = screen.getByRole("combobox", {
      name: "Filtrar por propósito",
    });
    await user.selectOptions(select, "balance");

    expect(handlePurposeChange).toHaveBeenCalledWith("balance");
  });

  it("renders status select with options and reflects selectedStatus", () => {
    render(<PaymentsFilters selectedStatus="approved" />);

    const select = screen.getByRole("combobox", {
      name: "Filtrar por estado",
    }) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("approved");
    expect(screen.getByRole("option", { name: "Todos los estados" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Aprobado" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pendiente" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Rechazado" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cancelado" })).toBeInTheDocument();
  });

  it("calls onStatusChange when selecting a status", async () => {
    const user = userEvent.setup();
    const handleStatusChange = vi.fn();
    render(<PaymentsFilters onStatusChange={handleStatusChange} />);

    const select = screen.getByRole("combobox", {
      name: "Filtrar por estado",
    });
    await user.selectOptions(select, "approved");

    expect(handleStatusChange).toHaveBeenCalledWith("approved");
  });
});
