import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Consumer } from "@/domain/users/consumer";
import { ConsumersView } from "./consumers-view";

describe("ConsumersView", () => {
  const sampleConsumers: Consumer[] = [
    {
      id: 1,
      name: "Ana",
      surname: "Pérez",
      email: "ana@example.com",
      profilePhotoUrl: "https://example.com/photos/ana.jpg",
      createdOn: "2026-09-10",
    },
    {
      id: 2,
      name: "Beatriz",
      surname: "Suárez",
      email: "beatriz@example.com",
      createdOn: "2026-09-12",
    },
  ];

  it("renders consumers table with headers, photos, names, emails and formatted dates", () => {
    render(<ConsumersView consumers={sampleConsumers} />);

    expect(screen.getByRole("columnheader", { name: "Foto" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Nombre" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Apellido" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Correo" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Fecha de registro" })).toBeInTheDocument();

    expect(screen.getByAltText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Pérez")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("10/09/2026")).toBeInTheDocument();

    // Beatriz doesn't have a photo url, renders initials BS
    expect(screen.getByLabelText("Beatriz Suárez")).toHaveTextContent("BS");
    expect(screen.getByText("Beatriz")).toBeInTheDocument();
    expect(screen.getByText("Suárez")).toBeInTheDocument();
    expect(screen.getByText("beatriz@example.com")).toBeInTheDocument();
    expect(screen.getByText("12/09/2026")).toBeInTheDocument();
  });

  it("renders loading indicator when isLoading is true", () => {
    render(<ConsumersView isLoading />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando consumidores...");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders empty state message when consumers list is empty", () => {
    render(<ConsumersView consumers={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent("No hay consumidores disponibles");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders forbidden alert when isForbidden is true", () => {
    render(<ConsumersView isForbidden />);

    expect(screen.getByRole("alert")).toHaveTextContent("Acceso restringido: no tenés permisos");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders error alert and calls onRetry on button click", async () => {
    const onRetry = vi.fn();
    render(<ConsumersView error="Error de conexión" onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Error de conexión");
    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("calls onSearchChange when user types in search input", async () => {
    const onSearchChange = vi.fn();
    render(<ConsumersView searchQuery="" onSearchChange={onSearchChange} />);

    const searchInput = screen.getByLabelText("Buscar consumidores");
    await userEvent.type(searchInput, "perez");
    expect(onSearchChange).toHaveBeenCalled();
  });
});
