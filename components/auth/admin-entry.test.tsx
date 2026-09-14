import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AdminEntry } from "./admin-entry";
const query = vi.hoisted(() => vi.fn(() => ({ status: "unauthenticated" })));
vi.mock("./use-admin-access", () => ({ useAdminAccess: query }));
it("offers authentication without rendering administrative content", () => {
  render(<AdminEntry />);
  expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
  expect(screen.queryByRole("region", { name: "Área de administración" })).not.toBeInTheDocument();
});

it("announces invalid authentication and offers a new sign-in", () => {
  query.mockReturnValue({ status: "sessionExpired" });
  render(<AdminEntry />);
  expect(screen.getByRole("alert")).toHaveTextContent("Iniciá sesión nuevamente para continuar.");
  expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
});
