import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OperationsFilterBar } from "./operations-filter-bar";

describe("OperationsFilterBar", () => {
  it("renders bottleneck filter combobox with default label and options", () => {
    render(<OperationsFilterBar />);

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todas las alertas" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Estancada > 24h" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Propuesta demorada > 24h" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Al día" })).toBeInTheDocument();
  });

  it("reflects the selectedBottleneck prop value", () => {
    render(<OperationsFilterBar selectedBottleneck="stalled" />);

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" }) as HTMLSelectElement;
    expect(select.value).toBe("stalled");
  });

  it("calls onBottleneckChange when a bottleneck option is selected", async () => {
    const user = userEvent.setup();
    const handleBottleneckChange = vi.fn();
    render(<OperationsFilterBar onBottleneckChange={handleBottleneckChange} />);

    const select = screen.getByRole("combobox", { name: "Alerta Operativa" });
    await user.selectOptions(select, "stalled");

    expect(handleBottleneckChange).toHaveBeenCalledWith("stalled");
  });

  it("renders search input with placeholder and calls onSearchChange when typing", async () => {
    const user = userEvent.setup();
    const handleSearchChange = vi.fn();
    render(
      <OperationsFilterBar
        searchQuery="Pérez"
        onSearchChange={handleSearchChange}
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Buscar participante" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Pérez");
    expect(screen.getByPlaceholderText("Buscar por cliente o prestador...")).toBeInTheDocument();

    await user.type(input, "a");
    expect(handleSearchChange).toHaveBeenCalled();
  });

  it("renders category select with options and calls onCategoryChange when selected", async () => {
    const user = userEvent.setup();
    const handleCategoryChange = vi.fn();
    const categoryOptions = [
      { id: 1, name: "Plomería" },
      { id: 2, name: "Electricidad" },
    ];

    render(
      <OperationsFilterBar
        selectedCategoryId={1}
        onCategoryChange={handleCategoryChange}
        categoryOptions={categoryOptions}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Rubro" }) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("1");
    expect(screen.getByRole("option", { name: "Todos los rubros" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Plomería" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Electricidad" })).toBeInTheDocument();

    await user.selectOptions(select, "2");
    expect(handleCategoryChange).toHaveBeenCalledWith(2);
  });
});
