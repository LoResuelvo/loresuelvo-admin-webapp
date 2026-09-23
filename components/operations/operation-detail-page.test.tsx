import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OperationDetailPage from "@/app/(dashboard)/operaciones/[id]/page";

describe("OperationDetailPage", () => {
  it("renders operation detail heading and id", async () => {
    const page = await OperationDetailPage({
      params: Promise.resolve({ id: "op-1" }),
    });
    render(page);

    expect(screen.getByRole("heading", { name: "Ficha de Operación" })).toBeInTheDocument();
    expect(screen.getByText("op-1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver/i })).toHaveAttribute("href", "/operaciones");
  });
});
