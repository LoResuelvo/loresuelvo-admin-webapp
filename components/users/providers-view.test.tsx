import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Provider } from "@/domain/users/provider";
import { ProvidersView } from "./providers-view";

describe("ProvidersView", () => {
  const sampleProviders: Provider[] = [
    {
      id: 1,
      name: "Juan",
      surname: "Gómez",
      email: "juan@example.com",
      profilePhotoUrl: "https://example.com/photos/juan.jpg",
      createdOn: "2026-09-10",
      category: { id: 10, name: "Plomería" },
      coverageZones: [
        { id: 1, name: "Comuna 6", code: "comuna_6" },
        { id: 2, name: "Comuna 14", code: "comuna_14" },
      ],
      identityVerificationStatus: "approved",
    },
    {
      id: 2,
      name: "Laura",
      surname: "Díaz",
      email: "laura@example.com",
      createdOn: "2026-09-12",
      category: { id: 11, name: "Electricidad" },
      coverageZones: [{ id: 3, name: "Comuna 1", code: "comuna_1" }],
      identityVerificationStatus: "in_review",
    },
  ];

  it("renders providers table with columns, names, rubro, coverage zones and verification badges", () => {
    render(<ProvidersView providers={sampleProviders} />);

    expect(screen.getByRole("columnheader", { name: "Foto" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Nombre" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Apellido" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Correo" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Rubro" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Zonas de cobertura" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Estado de verificación" })).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(screen.getByAltText("Juan Gómez")).toBeInTheDocument();
    expect(within(table).getByText("Juan")).toBeInTheDocument();
    expect(within(table).getByText("Gómez")).toBeInTheDocument();
    expect(within(table).getByText("juan@example.com")).toBeInTheDocument();
    expect(within(table).getByText("Plomería")).toBeInTheDocument();
    expect(within(table).getByText("Comuna 6, Comuna 14")).toBeInTheDocument();
    expect(within(table).getByText("Verificado")).toBeInTheDocument();

    // Laura without photo displays initials LD
    expect(screen.getByLabelText("Laura Díaz")).toHaveTextContent("LD");
    expect(within(table).getByText("Laura")).toBeInTheDocument();
    expect(within(table).getByText("Díaz")).toBeInTheDocument();
    expect(within(table).getByText("laura@example.com")).toBeInTheDocument();
    expect(within(table).getByText("Electricidad")).toBeInTheDocument();
    expect(within(table).getByText("Comuna 1")).toBeInTheDocument();
    expect(within(table).getByText("En revisión")).toBeInTheDocument();
  });

  it("renders loading indicator when isLoading is true", () => {
    render(<ProvidersView isLoading />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando prestadores...");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders empty state message when providers list is empty", () => {
    render(<ProvidersView providers={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent("No hay prestadores disponibles");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders forbidden alert when isForbidden is true", () => {
    render(<ProvidersView isForbidden />);

    expect(screen.getByRole("alert")).toHaveTextContent("Acceso restringido: no tenés permisos");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders error alert and calls onRetry on button click", async () => {
    const onRetry = vi.fn();
    render(<ProvidersView error="Error al cargar prestadores" onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Error al cargar prestadores");
    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("calls onSearchChange when typing in search input", async () => {
    const onSearchChange = vi.fn();
    render(<ProvidersView searchQuery="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByLabelText("Buscar prestadores");
    await userEvent.type(searchInput, "juan");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("renders category and status filter controls with default options", () => {
    render(<ProvidersView providers={sampleProviders} />);

    const categorySelect = screen.getByLabelText("Filtrar por rubro");
    expect(categorySelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todos los rubros" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Plomería" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Electricidad" })).toBeInTheDocument();

    const statusSelect = screen.getByLabelText("Filtrar por estado");
    expect(statusSelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todos los estados" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Verificado" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "En revisión" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Rechazado" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sin verificar" })).toBeInTheDocument();
  });

  it("calls onCategoryChange when selecting a category option", async () => {
    const onCategoryChange = vi.fn();
    render(<ProvidersView providers={sampleProviders} onCategoryChange={onCategoryChange} />);

    const categorySelect = screen.getByLabelText("Filtrar por rubro");
    await userEvent.selectOptions(categorySelect, "Plomería");
    expect(onCategoryChange).toHaveBeenCalledWith("Plomería");
  });

  it("calls onStatusChange when selecting a verification status option", async () => {
    const onStatusChange = vi.fn();
    render(<ProvidersView providers={sampleProviders} onStatusChange={onStatusChange} />);

    const statusSelect = screen.getByLabelText("Filtrar por estado");
    await userEvent.selectOptions(statusSelect, "approved");
    expect(onStatusChange).toHaveBeenCalledWith("approved");
  });
});

