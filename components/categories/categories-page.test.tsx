import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoriesPage } from "./categories-page";

describe("CategoriesPage", () => {
  const sampleCategories = [
    { id: 1, name: "Albañilería" },
    { id: 2, name: "Electricidad" },
    { id: 3, name: "Plomería" },
  ];

  it("renders category catalog with ID and Name columns and rows", () => {
    render(<CategoriesPage categories={sampleCategories} />);

    expect(screen.getByRole("heading", { name: "Catálogo de Rubros", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "ID" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Nombre" })).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4);
    expect(screen.getByText("Albañilería")).toBeInTheDocument();
    expect(screen.getByText("Electricidad")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
  });

  it("renders loading indicator when isLoading is true", () => {
    render(<CategoriesPage isLoading />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando rubros...");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders empty state message when there are no categories", () => {
    render(<CategoriesPage categories={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent("No hay rubros registrados");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders error alert and retry button when error occurs", async () => {
    const onRetry = vi.fn();
    render(<CategoriesPage error="No se pudieron obtener los rubros" onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudieron obtener los rubros");
    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("opens create modal when clicking Nuevo rubro button", async () => {
    render(<CategoriesPage categories={sampleCategories} />);

    const newButton = screen.getByRole("button", { name: "Nuevo rubro" });
    await userEvent.click(newButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nuevo rubro" })).toBeInTheDocument();
  });

  it("calls onCreateCategory and displays success message on successful creation", async () => {
    const onCreateCategory = vi.fn().mockResolvedValue(undefined);
    render(<CategoriesPage categories={sampleCategories} onCreateCategory={onCreateCategory} />);

    const newButton = screen.getByRole("button", { name: "Nuevo rubro" });
    await userEvent.click(newButton);

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.type(input, "Pintura");

    const submitButton = screen.getByRole("button", { name: "Crear rubro" });
    await userEvent.click(submitButton);

    expect(onCreateCategory).toHaveBeenCalledWith("Pintura");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Rubro creado exitosamente");
  });

  it("renders edit action button with accessible aria-label for each category", () => {
    render(<CategoriesPage categories={sampleCategories} />);

    expect(screen.getByRole("button", { name: "Editar rubro Albañilería" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar rubro Electricidad" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar rubro Plomería" })).toBeInTheDocument();
  });

  it("opens edit modal when clicking edit button", async () => {
    render(<CategoriesPage categories={sampleCategories} />);

    const editButton = screen.getByRole("button", { name: "Editar rubro Plomería" });
    await userEvent.click(editButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editar rubro" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del rubro")).toHaveValue("Plomería");
  });

  it("calls onUpdateCategory and displays success message on successful update", async () => {
    const onUpdateCategory = vi.fn().mockResolvedValue(undefined);
    render(<CategoriesPage categories={sampleCategories} onUpdateCategory={onUpdateCategory} />);

    const editButton = screen.getByRole("button", { name: "Editar rubro Plomería" });
    await userEvent.click(editButton);

    const input = screen.getByLabelText("Nombre del rubro");
    await userEvent.clear(input);
    await userEvent.type(input, "Instalaciones Sanitarias");

    const submitButton = screen.getByRole("button", { name: "Guardar cambios" });
    await userEvent.click(submitButton);

    expect(onUpdateCategory).toHaveBeenCalledWith(3, "Instalaciones Sanitarias");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Rubro actualizado exitosamente");
  });
});

