import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Home from "./page";

it("renders the fixed incomplete sign-in notice", async () => {
  render(await Home({ searchParams: Promise.resolve({ auth: "incomplete" }) }));
  expect(screen.getByRole("alert")).toHaveTextContent("No se completó el inicio de sesión.");
  expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
});

it.each([undefined, "sensitive-error-token", ["incomplete", "sensitive-error-token"]])(
  "ignores unrecognized or repeated authentication signals: %s",
  async auth => {
    render(await Home({ searchParams: Promise.resolve({ auth }) }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(/sensitive-error-token/)).not.toBeInTheDocument();
  },
);
