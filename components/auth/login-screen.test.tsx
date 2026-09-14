import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginScreen } from "./login-screen";

describe("LoginScreen", () => {
  it("presents the administrator entry without password or registration controls", () => {
    render(<LoginScreen onSignIn={vi.fn()} />);

    expect(screen.getByText("Lo Resuelvo")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Todo listo para empezar." })).toBeVisible();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
    expect(screen.getByText("Accedé con tu cuenta de administrador.")).toBeVisible();
    expect(screen.getByText("Acceso exclusivo para personal autorizado.")).toBeVisible();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(document.querySelector('input[type="password"]')).not.toBeInTheDocument();
    expect(screen.queryByText(/registr|crear cuenta/i)).not.toBeInTheDocument();
  });

  it("delegates the sign-in action to its caller", async () => {
    const onSignIn = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onSignIn={onSignIn} />);

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(onSignIn).toHaveBeenCalledOnce();
  });
});

describe("sign-in redirect feedback", () => {
  it("prevents another request while the redirect is pending", async () => {
    const onSignIn = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onSignIn={onSignIn} />);
    const button = screen.getByRole("button", { name: "Iniciar sesión" });
    await user.dblClick(button);
    expect(onSignIn).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Redirigiendo al inicio de sesión");
  });
});
