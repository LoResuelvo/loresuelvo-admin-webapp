import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationLinkCard } from "./operation-link-card";

describe("OperationLinkCard", () => {
  it("renders link towards associated operation with correct href and id", () => {
    render(<OperationLinkCard operationId={42} />);

    expect(screen.getByRole("region", { name: "Contratación vinculada" })).toBeInTheDocument();
    const link = screen.getByTestId("operation-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/operaciones/42");
    expect(link).toHaveTextContent("Contratación #42");
  });
});
