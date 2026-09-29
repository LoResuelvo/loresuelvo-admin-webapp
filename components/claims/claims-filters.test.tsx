import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClaimsFilters, type ClaimsFiltersState } from "./claims-filters";

describe("ClaimsFilters", () => {
  const defaultFilters: ClaimsFiltersState = {
    status: "",
    q: "",
  };

  it("renders status select and participant search input", () => {
    render(<ClaimsFilters filters={defaultFilters} onChange={vi.fn()} />);

    expect(
      screen.getByRole("combobox", { name: "Filtrar por estado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por participante..."),
    ).toBeInTheDocument();
  });

  it("calls onChange when selecting a status", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<ClaimsFilters filters={defaultFilters} onChange={handleChange} />);

    const select = screen.getByRole("combobox", { name: "Filtrar por estado" });
    await user.selectOptions(select, "open");

    expect(handleChange).toHaveBeenCalledWith({
      status: "open",
      q: "",
    });
  });

  it("calls onChange when typing in the search input", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<ClaimsFilters filters={defaultFilters} onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Buscar por participante...");
    await user.type(input, "López");

    expect(handleChange).toHaveBeenCalled();
  });

  it("shows clear button when filters are active and clears on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const activeFilters: ClaimsFiltersState = {
      status: "open",
      q: "López",
    };

    render(<ClaimsFilters filters={activeFilters} onChange={handleChange} />);

    const clearButton = screen.getByRole("button", { name: "Limpiar filtros" });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith({
      status: "",
      q: "",
    });
  });
});
