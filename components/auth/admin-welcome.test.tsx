import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AdminWelcome } from "./admin-welcome";

it("presents the verified welcome without invented metrics", () => {
  render(<AdminWelcome />);
  expect(screen.getByRole("region", { name: "Área de administración" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Te damos la bienvenida." })).toBeVisible();
});
