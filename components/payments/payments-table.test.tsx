import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PaymentsTable } from "./payments-table";
import { multiplePaymentFixtures, paymentFixture } from "./payment-test-fixtures";

describe("PaymentsTable", () => {
  it("renders columns from the payment API fields", () => {
    render(<PaymentsTable items={multiplePaymentFixtures.slice(0, 1)} />);

    expect(screen.getByRole("columnheader", { name: "Referencia" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Propósito" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Cliente" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Prestador" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Total del pago" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Estado de intención" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Creado (Argentina)" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Detalle" })).toBeInTheDocument();
  });

  it("renders available IDs, transaction identifiers, and the API monetary amounts", () => {
    render(<PaymentsTable items={multiplePaymentFixtures.slice(0, 1)} />);

    expect(screen.getByText("0f8fad5b-d9cb-469f-a165-70867728950e")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cliente #1" })).toHaveAttribute("href", "/usuarios/consumidores/1");
    expect(screen.getByRole("link", { name: "Prestador #2" })).toHaveAttribute("href", "/usuarios/prestadores/2");
    expect(screen.getByRole("cell", { name: "$ 20.000,00" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Composición financiera" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Neto del prestador" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Comisión de plataforma" })).not.toBeInTheDocument();
  });

  it("uses full names as profile links and links only to the canonical operation ID", () => {
    render(
      <PaymentsTable
        items={[
          paymentFixture({
            consumerName: "Ana Rivera",
            providerName: "Mario López",
            operationId: "jr-123",
          }),
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Ana Rivera" })).toHaveAttribute("href", "/usuarios/consumidores/1");
    expect(screen.getByRole("link", { name: "Mario López" })).toHaveAttribute("href", "/usuarios/prestadores/2");
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Operación: jr-123" })).toHaveAttribute("href", "/operaciones/jr-123");
  });

  it("does not infer an operation link from the service proposal ID", () => {
    render(<PaymentsTable items={[paymentFixture({ serviceProposalId: 123 })]} />);

    expect(screen.queryByRole("link", { name: /Operación/ })).not.toBeInTheDocument();
  });

  it("opens the financial context and keeps processor settlement separate from the assigned seller amount", async () => {
    const user = userEvent.setup();
    render(<PaymentsTable items={[paymentFixture()]} />);

    await user.click(screen.getByText("Ver desglose y referencias"));

    expect(screen.getByText("Cobros aprobados por el procesador")).toBeInTheDocument();
    expect(screen.getAllByText("$ 20.000,00").length).toBeGreaterThan(1);
    expect(screen.getByText("Monto asignado al prestador")).toBeInTheDocument();
    expect(screen.getByText("No representa una liquidación confirmada.")).toBeInTheDocument();
    expect(screen.getByText("Liquidación neta informada por el procesador")).toBeInTheDocument();
    expect(screen.getAllByText("No informado").length).toBeGreaterThan(0);
    expect(screen.getByText("pay_1001")).toBeInTheDocument();
    expect(screen.getByText("Importe de seña")).toBeInTheDocument();
    expect(screen.getByText("$ 5.000,00")).toBeInTheDocument();
  });

  it("shows translated known anomalies and a Spanish fallback without exposing unknown codes", () => {
    render(
      <PaymentsTable
        items={[
          paymentFixture({
            anomalies: ["payment_mismatch", "unrecognized_processor_condition"],
            summary: {
              approvedAmounts: [],
              pendingAmount: null,
              anomalies: ["payment_mismatch", "unrecognized_processor_condition"],
            },
          }),
        ]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("El importe informado requiere revisión.");
    expect(screen.getByRole("alert")).toHaveTextContent("Se detectó una condición que requiere revisión manual.");
    expect(screen.queryByText("unrecognized_processor_condition")).not.toBeInTheDocument();
  });
});
