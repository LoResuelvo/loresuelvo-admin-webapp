import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AccessLoading } from "./access-loading";

it("announces access verification without administrative content", () => {
  render(<AccessLoading />);
  expect(screen.getByRole("status")).toHaveTextContent("Estamos verificando tu acceso…");
  expect(screen.queryByRole("region", { name: "Área de administración" })).not.toBeInTheDocument();
});
