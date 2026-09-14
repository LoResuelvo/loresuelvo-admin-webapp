import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { AdminWelcome } from "./admin-welcome";
it("presents the verified administrator identity and welcome without invented metrics", () => {
  render(<AdminWelcome profile={{ id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" }} />);
  expect(within(screen.getByRole("banner")).getByText("Ana Pérez")).toBeVisible();
  expect(within(screen.getByRole("banner")).getByText("ana@example.com")).toBeVisible();
  expect(screen.getByRole("region", { name: "Área de administración" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Te damos la bienvenida." })).toBeVisible();
});
