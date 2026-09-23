import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

describe("Sidebar", () => {
  const profile = {
    id: 1,
    firstName: "Ana",
    lastName: "Pérez",
    email: "ana@example.com",
    role: "admin" as const,
  };

  it("renders the banner with brand, area indicator and administrator identity", () => {
    render(<Sidebar profile={profile} />);

    const banner = screen.getByRole("banner");
    expect(within(banner).getByText("Lo Resuelvo")).toBeVisible();
    expect(within(banner).getByText("Administración")).toBeVisible();
    expect(within(banner).getByText("Ana Pérez")).toBeVisible();
    expect(within(banner).getByText("ana@example.com")).toBeVisible();
  });

  it("renders navigation links to Users Directory, Categories Catalog, and Operations Center", () => {
    render(<Sidebar profile={profile} />);

    const usersLink = screen.getByRole("link", { name: "Directorio de Usuarios" });
    const categoriesLink = screen.getByRole("link", { name: "Catálogo de Rubros" });
    const operationsLink = screen.getByRole("link", { name: "Centro de Operaciones" });

    expect(usersLink).toBeVisible();
    expect(usersLink).toHaveAttribute("href", "/usuarios");
    expect(categoriesLink).toBeVisible();
    expect(categoriesLink).toHaveAttribute("href", "/rubros");
    expect(operationsLink).toBeVisible();
    expect(operationsLink).toHaveAttribute("href", "/operaciones");
  });


  it("renders the logout option pointing to the logout route", () => {
    render(<Sidebar profile={profile} />);

    const logoutOption = screen.getByRole("button", { name: "Cerrar sesión" });
    expect(logoutOption).toBeVisible();
    expect(logoutOption).toHaveAttribute("href", "/auth/logout");
  });
});
