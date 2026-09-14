import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AccessIssue } from "./access-issue";
it("announces the account issue without exposing registration or protected content", () => {
  render(<AccessIssue message="Cuenta no habilitada" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Cuenta no habilitada");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
