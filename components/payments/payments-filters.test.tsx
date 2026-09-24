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
});
