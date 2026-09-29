import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditFiltersBar } from "./audit-filters-bar";

describe("AuditFiltersBar", () => {
  it("renders action filter select with all options", () => {
    const handleChange = vi.fn();
    render(<AuditFiltersBar filters={{ action: "" }} onChange={handleChange} />);

    expect(screen.getByRole("search", { name: "Filtros de auditoría" })).toBeInTheDocument();

    const select = screen.getByLabelText("Filtrar por acción");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Todas las acciones")).toBeInTheDocument();
    expect(screen.getByText("Acceso a chat privado")).toBeInTheDocument();
    expect(screen.getByText("Resolución de reclamo")).toBeInTheDocument();
  });

  it("calls onChange when selecting an action", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<AuditFiltersBar filters={{ action: "" }} onChange={handleChange} />);

    const select = screen.getByLabelText("Filtrar por acción");
    await user.selectOptions(select, "chat_access");

    expect(handleChange).toHaveBeenCalledWith({ action: "chat_access" });
  });

  it("renders clear button when action filter is active and clears on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<AuditFiltersBar filters={{ action: "chat_access" }} onChange={handleChange} />);

    const clearBtn = screen.getByRole("button", { name: "Limpiar filtros" });
    expect(clearBtn).toBeInTheDocument();

    await user.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith({ action: "", operator: "" });
  });

  it("renders operator search input and calls onChange on typing", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<AuditFiltersBar filters={{ operator: "" }} onChange={handleChange} />);

    const searchInput = screen.getByLabelText("Buscar por operador");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("placeholder", "Buscar por correo del operador...");

    await user.type(searchInput, "op");
    expect(handleChange).toHaveBeenCalled();
  });
});
