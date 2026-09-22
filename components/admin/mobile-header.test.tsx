import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileHeader } from "./mobile-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

describe("MobileHeader", () => {
  const profile = {
    id: 1,
    firstName: "Ana",
    lastName: "Pérez",
    email: "ana@example.com",
    role: "admin" as const,
  };

  it("renders collapsed menu button by default with aria-expanded=false", () => {
    render(<MobileHeader profile={profile} />);

    const openButton = screen.getByRole("button", { name: "Abrir menú de navegación" });
    expect(openButton).toBeVisible();
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens menu overlay when clicking hamburger toggle button", () => {
    render(<MobileHeader profile={profile} />);

    const openButton = screen.getByRole("button", { name: "Abrir menú de navegación" });
    fireEvent.click(openButton);

    expect(openButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Ana Pérez")).toBeVisible();
    expect(screen.getByText("ana@example.com")).toBeVisible();
    expect(screen.getByRole("link", { name: "Directorio de Usuarios" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Catálogo de Rubros" })).toBeVisible();

    const logoutOption = screen.getByRole("button", { name: "Cerrar sesión" });
    expect(logoutOption).toBeVisible();
    expect(logoutOption).toHaveAttribute("href", "/auth/logout");
  });

  it("closes menu overlay when clicking close button", () => {
    render(<MobileHeader profile={profile} />);

    const openButton = screen.getByRole("button", { name: "Abrir menú de navegación" });
    fireEvent.click(openButton);

    const closeButton = screen.getByRole("button", { name: "Cerrar menú de navegación" });
    expect(closeButton).toBeVisible();
    fireEvent.click(closeButton);

    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
