import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavLink } from "./nav-link";

let mockPathname = "/admin";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("NavLink", () => {
  it("renders with aria-current='page' and activeClassName when matching current pathname", () => {
    mockPathname = "/rubros";
    render(
      <NavLink href="/rubros" activeClassName="bg-amber-100 font-bold" className="text-gray-700">
        Catálogo de Rubros
      </NavLink>,
    );

    const link = screen.getByRole("link", { name: "Catálogo de Rubros" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("href", "/rubros");
    expect(link.className).toContain("bg-amber-100 font-bold");
  });

  it("does not set aria-current when pathname does not match", () => {
    mockPathname = "/admin";
    render(
      <NavLink href="/rubros" activeClassName="bg-amber-100 font-bold" className="text-gray-700">
        Catálogo de Rubros
      </NavLink>,
    );

    const link = screen.getByRole("link", { name: "Catálogo de Rubros" });
    expect(link).not.toHaveAttribute("aria-current");
    expect(link.className).not.toContain("bg-amber-100");
  });
});
