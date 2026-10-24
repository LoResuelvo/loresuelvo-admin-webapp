import { isValidElement } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "./page";

const { getSession, redirect } = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue(null),
  redirect: vi.fn((destination: string): never => {
    throw new Error(`REDIRECT:${destination}`);
  }),
}));

vi.mock("@/infrastructure/auth/auth0", () => ({
  getAuth0: () => ({ getSession }),
}));

vi.mock("next/navigation", () => ({ redirect }));

afterEach(() => {
  getSession.mockReset();
  getSession.mockResolvedValue(null);
  redirect.mockClear();
});

it("renders the fixed incomplete sign-in notice", async () => {
  render(await Home({ searchParams: Promise.resolve({ auth: "incomplete" }) }));
  expect(screen.getByRole("alert")).toHaveTextContent("No se completó el inicio de sesión.");
  expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
});

it("returns authenticated users to their safe destination or the operations default", async () => {
  getSession.mockResolvedValue({
    user: { sub: "auth0|admin" },
    tokenSet: { accessToken: "test-access-token", expiresAt: 9999999999 },
    internal: { sid: "session-id", createdAt: 1 },
  });

  await expect(Home({ searchParams: Promise.resolve({}) })).rejects.toThrow("REDIRECT:/operaciones");
  await expect(
    Home({ searchParams: Promise.resolve({ returnTo: "/reclamos?status=open" }) }),
  ).rejects.toThrow("REDIRECT:/reclamos?status=open");
});

it("preserves a safe returnTo on the sign-in entry", async () => {
  const page = await Home({ searchParams: Promise.resolve({ returnTo: "/reclamos?status=open" }) });
  expect(isValidElement<{ returnTo?: string }>(page)).toBe(true);
  if (!isValidElement<{ returnTo?: string }>(page)) {
    throw new Error("Expected a login entry");
  }
  expect(page.props.returnTo).toBe("/reclamos?status=open");
  render(page);
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
