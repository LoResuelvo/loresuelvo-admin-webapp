import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  FunnelFiltersBar,
  computeDateRange,
} from "./funnel-filters-bar";

describe("FunnelFiltersBar", () => {
  it("renders the period selector with preset options", () => {
    render(<FunnelFiltersBar selectedPeriod="7d" />);

    const select = screen.getByRole("combobox", { name: "Rango temporal" });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Últimos 7 días" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Últimos 30 días" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Últimos 90 días" })).toBeInTheDocument();
    expect(select).toHaveValue("7d");
  });

  it("calls onPeriodChange when a different period is selected", () => {
    const handlePeriodChange = vi.fn();
    render(
      <FunnelFiltersBar
        selectedPeriod="7d"
        onPeriodChange={handlePeriodChange}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Rango temporal" });
    fireEvent.change(select, { target: { value: "30d" } });

    expect(handlePeriodChange).toHaveBeenCalledWith("30d");
  });

  it("renders category selector with default options", () => {
    render(<FunnelFiltersBar />);

    const select = screen.getByRole("combobox", { name: "Rubro" });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todos los rubros" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Plomería" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Electricidad" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Gas" })).toBeInTheDocument();
  });

  it("calls onCategoryChange when category is selected", () => {
    const handleCategoryChange = vi.fn();
    render(
      <FunnelFiltersBar
        selectedCategoryId=""
        onCategoryChange={handleCategoryChange}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Rubro" });
    fireEvent.change(select, { target: { value: "1" } });

    expect(handleCategoryChange).toHaveBeenCalledWith(1);
  });

  it("renders date inputs and calls change handlers", () => {
    const handleFromChange = vi.fn();
    const handleToChange = vi.fn();
    render(
      <FunnelFiltersBar
        fromDate="2026-08-01"
        toDate="2026-08-31"
        onFromDateChange={handleFromChange}
        onToDateChange={handleToChange}
      />,
    );

    const fromInput = screen.getByLabelText("Fecha desde");
    const toInput = screen.getByLabelText("Fecha hasta");

    expect(fromInput).toHaveValue("2026-08-01");
    expect(toInput).toHaveValue("2026-08-31");

    fireEvent.change(fromInput, { target: { value: "2026-09-01" } });
    expect(handleFromChange).toHaveBeenCalledWith("2026-09-01");

    fireEvent.change(toInput, { target: { value: "2026-09-30" } });
    expect(handleToChange).toHaveBeenCalledWith("2026-09-30");
  });

  it("calls onApplyFilters when the apply button is clicked", () => {
    const handleApply = vi.fn();
    render(<FunnelFiltersBar onApplyFilters={handleApply} />);

    const applyButton = screen.getByRole("button", { name: "Aplicar filtros" });
    fireEvent.click(applyButton);

    expect(handleApply).toHaveBeenCalledTimes(1);
  });

  describe("computeDateRange", () => {
    it("computes dates for 30d preset", () => {
      const { from, to } = computeDateRange("30d", new Date("2026-09-24T00:00:00Z"));
      expect(to).toBe("2026-09-24");
      expect(from).toBe("2026-08-25");
    });

    it("computes dates for 7d preset", () => {
      const { from, to } = computeDateRange("7d", new Date("2026-09-24T00:00:00Z"));
      expect(to).toBe("2026-09-24");
      expect(from).toBe("2026-09-17");
    });

    it("computes dates for 90d preset", () => {
      const { from, to } = computeDateRange("90d", new Date("2026-09-24T00:00:00Z"));
      expect(to).toBe("2026-09-24");
      expect(from).toBe("2026-06-26");
    });
  });
});
