import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentsTable } from "./payments-table";
import { multiplePaymentFixtures } from "./payment-test-fixtures";

describe("PaymentsTable", () => {
  it("renders columns from the payment API fields", () => {
    render(<PaymentsTable items={multiplePaymentFixtures.slice(0, 1)} />);

    expect(screen.getByRole("columnheader", { name: "ID de intención de pago" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Propósito" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "ID de cliente" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "ID de prestador" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Total del pago" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Estado de intención" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Creado" })).toBeInTheDocument();
  });

  it("renders available IDs, transaction identifiers, and the API monetary amounts", () => {
    render(<PaymentsTable items={multiplePaymentFixtures.slice(0, 1)} />);

    expect(screen.getByText("0f8fad5b-d9cb-469f-a165-70867728950e")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("Transacción externa: pay_1001")).toBeInTheDocument();
    expect(screen.getByText("$ 20.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 17.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 3.000,00")).toBeInTheDocument();
  });
});
