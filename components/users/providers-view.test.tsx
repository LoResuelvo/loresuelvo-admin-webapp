import { render, screen } from "@testing-library/react";
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

    expect(screen.getByAltText("Juan Gómez")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Gómez")).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
    expect(screen.getByText("Comuna 6, Comuna 14")).toBeInTheDocument();
    expect(screen.getByText("Verificado")).toBeInTheDocument();

    // Laura without photo displays initials LD
    expect(screen.getByLabelText("Laura Díaz")).toHaveTextContent("LD");
    expect(screen.getByText("Laura")).toBeInTheDocument();
    expect(screen.getByText("Díaz")).toBeInTheDocument();
    expect(screen.getByText("laura@example.com")).toBeInTheDocument();
    expect(screen.getByText("Electricidad")).toBeInTheDocument();
    expect(screen.getByText("Comuna 1")).toBeInTheDocument();
    expect(screen.getByText("En revisión")).toBeInTheDocument();
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
});
