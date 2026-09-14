import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AdminEntry } from "./admin-entry";
vi.mock("./use-admin-access", () => ({ useAdminAccess: () => ({ status: "unauthenticated" }) }));
it("offers authentication without rendering administrative content", () => {
  render(<AdminEntry />);
  expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
  expect(screen.queryByRole("region", { name: "Área de administración" })).not.toBeInTheDocument();
});
