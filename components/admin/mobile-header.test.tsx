import userEvent from "@testing-library/user-event";
import { ROUTES } from "@/lib/routes";
import { translations } from "@/infrastructure/i18n/translations";
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

  it("includes every administration destination and closes with Escape returning focus", async () => {
    const user = userEvent.setup();
    render(<MobileHeader profile={profile} />);
    const trigger = screen.getByRole("button", { name: "Abrir menú de navegación" });
    await user.click(trigger);
    expect(screen.getByRole("button", { name: "Cerrar menú de navegación" })).toHaveFocus();
    for (const destination of ["users", "categories", "operations", "payments", "metrics", "claims", "audit", "moderation"] as const) {
      expect(screen.getByRole("link", { name: translations.navigation[destination] })).toHaveAttribute("href", ROUTES[destination]);
    }
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cerrar menú de navegación" })).toHaveFocus();
    expect(document.body).toHaveAttribute("data-scroll-locked", "1");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await vi.waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes the drawer on backdrop and destination activation", async () => {
    const user = userEvent.setup();
    render(<MobileHeader profile={profile} />);
    const trigger = screen.getByRole("button", { name: "Abrir menú de navegación" });
    await user.click(trigger);
    await user.click(screen.getByTestId("modal-backdrop"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(trigger);
    await user.click(screen.getByRole("link", { name: "Directorio de Usuarios" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
