import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AdminWelcome } from "./admin-welcome";
import { translations } from "@/infrastructure/i18n/translations";

it("presents the administration area with its current description", () => {
  render(<AdminWelcome />);
  expect(screen.getByRole("region", { name: "Área de administración" })).toBeVisible();
  expect(screen.getByText(translations.auth.welcomeDescription)).toBeVisible();
  expect(screen.queryByRole("heading")).not.toBeInTheDocument();
});
