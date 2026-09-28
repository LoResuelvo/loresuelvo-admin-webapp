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
