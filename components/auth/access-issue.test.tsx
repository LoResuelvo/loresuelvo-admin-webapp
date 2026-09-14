import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AccessIssue } from "./access-issue";
it("announces the account issue without exposing registration or protected content", () => {
  render(<AccessIssue message="Cuenta no habilitada" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Cuenta no habilitada");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
it("offers an actionable retry for recoverable errors", async () => {
  const { default: userEvent } = await import("@testing-library/user-event");
  const { vi } = await import("vitest");
  const retry = vi.fn();
  render(<AccessIssue message="Error temporal" onRetry={retry} />);
  await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
  expect(retry).toHaveBeenCalledTimes(1);
});
