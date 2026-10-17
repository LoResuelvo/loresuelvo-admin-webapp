import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditFiltersBar } from "./audit-filters-bar";

describe("AuditFiltersBar", () => {
  it("renders the API-supported action filters", () => {
    const handleChange = vi.fn();
    render(<AuditFiltersBar filters={{ action: "" }} onChange={handleChange} />);

    expect(screen.getByRole("search", { name: "Filtros de auditoría" })).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por acción")).toBeInTheDocument();
    expect(screen.getByText("Todas las acciones")).toBeInTheDocument();
    expect(screen.getByText("Creación")).toBeInTheDocument();
    expect(screen.getByText("Acceso")).toBeInTheDocument();
    expect(screen.getByText("Ejecución")).toBeInTheDocument();
  });

  it("calls onChange when selecting an action", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<AuditFiltersBar filters={{ action: "" }} onChange={handleChange} />);

    await user.selectOptions(screen.getByLabelText("Filtrar por acción"), "access");
    expect(handleChange).toHaveBeenCalledWith({ action: "access" });
  });

  it("clears selected filters", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<AuditFiltersBar filters={{ action: "access" }} onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(handleChange).toHaveBeenCalledWith({ action: "", operatorId: "", from: "", to: "" });
  });

  it("filters by a numeric operator identifier", () => {
    const handleChange = vi.fn();
    render(<AuditFiltersBar filters={{ operatorId: "" }} onChange={handleChange} />);

    const operatorInput = screen.getByLabelText("Filtrar por ID del operador");
    expect(operatorInput).toHaveAttribute("type", "number");
    expect(operatorInput).toHaveAttribute("min", "1");
    expect(operatorInput).toHaveAttribute("placeholder", "Ingresá el ID del operador...");
    fireEvent.change(operatorInput, { target: { value: "101" } });
    expect(handleChange).toHaveBeenCalledWith({ operatorId: "101" });
  });

  it("renders date range inputs and calls onChange on date change", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<AuditFiltersBar filters={{ from: "", to: "" }} onChange={handleChange} />);

    const fromInput = screen.getByLabelText("Fecha desde");
    const toInput = screen.getByLabelText("Fecha hasta");
    expect(fromInput).toBeInTheDocument();
    expect(toInput).toBeInTheDocument();

    await user.type(fromInput, "2026-09-01");
    expect(handleChange).toHaveBeenCalledWith({ from: "2026-09-01", to: "" });
    await user.type(toInput, "2026-09-20");
    expect(handleChange).toHaveBeenCalledWith({ from: "", to: "2026-09-20" });
  });

  it("clears active date filters", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AuditFiltersBar
        filters={{ from: "2026-09-01", to: "2026-09-20" }}
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(handleChange).toHaveBeenCalledWith({
      action: "",
      operatorId: "",
      from: "",
      to: "",
    });
  });
});
