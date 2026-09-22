import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminShell } from "./admin-shell";

const query = vi.hoisted(() => vi.fn());
vi.mock("@/components/auth/use-admin-access", () => ({ useAdminAccess: query }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

describe("AdminShell", () => {
  it("renders sidebar and children within main when access is ready", () => {
    query.mockReturnValue({
      status: "ready",
      profile: { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" },
    });

    render(
      <AdminShell>
        <div>Contenido del Panel</div>
      </AdminShell>,
    );

    expect(screen.getByRole("banner")).toBeVisible();
    expect(within(screen.getByRole("banner")).getByText("Ana Pérez")).toBeVisible();
    expect(screen.getByRole("link", { name: "Directorio de Usuarios" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Catálogo de Rubros" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Abrir menú de navegación" })).toBeVisible();
    expect(screen.getByRole("main")).toHaveTextContent("Contenido del Panel");
  });

  it("renders login entry when unauthenticated", () => {
    query.mockReturnValue({ status: "unauthenticated" });

    render(
      <AdminShell>
        <div>Contenido protegido</div>
      </AdminShell>,
    );

    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("renders loading state when access verification is pending", () => {
    query.mockReturnValue({ status: "pending" });

    render(
      <AdminShell>
        <div>Contenido protegido</div>
      </AdminShell>,
    );

    expect(screen.getByRole("status")).toBeVisible();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });
});
