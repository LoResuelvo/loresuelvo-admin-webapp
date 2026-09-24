import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConsumerHistoryFilters } from "./consumer-history-filters";

describe("ConsumerHistoryFilters", () => {
  it("renders interaction type and status select filters with accessible labels", () => {
    render(<ConsumerHistoryFilters />);

    expect(
      screen.getByRole("combobox", { name: "Tipo de interacción" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Estado" }),
    ).toBeInTheDocument();
  });

  it("renders default options for all types and all statuses", () => {
    render(<ConsumerHistoryFilters />);

    const typeSelect = screen.getByRole("combobox", { name: "Tipo de interacción" });
    const statusSelect = screen.getByRole("combobox", { name: "Estado" });

    expect(typeSelect).toHaveValue("all");
    expect(statusSelect).toHaveValue("all");
    expect(screen.getByRole("option", { name: "Todos los tipos" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Órdenes de trabajo" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Propuestas de servicio" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Solicitudes de trabajo" })).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Todos los estados" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Completada" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "En progreso" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cancelada" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pendiente" })).toBeInTheDocument();
  });

  it("calls onTypeChange when type is selected", () => {
    const handleTypeChange = vi.fn();
    render(<ConsumerHistoryFilters onTypeChange={handleTypeChange} />);

    const typeSelect = screen.getByRole("combobox", { name: "Tipo de interacción" });
    fireEvent.change(typeSelect, { target: { value: "work_order" } });

    expect(handleTypeChange).toHaveBeenCalledWith("work_order");
  });

  it("calls onStatusChange when status is selected", () => {
    const handleStatusChange = vi.fn();
    render(<ConsumerHistoryFilters onStatusChange={handleStatusChange} />);

    const statusSelect = screen.getByRole("combobox", { name: "Estado" });
    fireEvent.change(statusSelect, { target: { value: "completed" } });

    expect(handleStatusChange).toHaveBeenCalledWith("completed");
  });

  it("reflects selected values passed in props", () => {
    render(
      <ConsumerHistoryFilters
        selectedType="service_proposal"
        selectedStatus="in_progress"
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Tipo de interacción" }),
    ).toHaveValue("service_proposal");
    expect(
      screen.getByRole("combobox", { name: "Estado" }),
    ).toHaveValue("in_progress");
  });
});
