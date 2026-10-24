import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PaymentsTable } from "./payments-table";
import { multiplePaymentFixtures, paymentFixture } from "./payment-test-fixtures";

describe("PaymentsTable", () => {
  it("renders the payment scan columns", () => {
    render(<PaymentsTable items={multiplePaymentFixtures.slice(0, 1)} />);

    expect(screen.getByRole("table", { name: "Listado de pagos" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Creado (Argentina)" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Participantes" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Propósito" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Total del pago" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Estado de intención" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Detalle" })).toBeInTheDocument();
  });

  it("keeps the scan focused on names and total, with references in the payment dialog", async () => {
    const user = userEvent.setup();
    const { container } = render(<PaymentsTable items={multiplePaymentFixtures.slice(0, 1)} />);

    expect(screen.getByRole("link", { name: "Cliente #1" })).toHaveAttribute("href", "/usuarios/consumidores/1");
    expect(screen.getByRole("link", { name: "Prestador #2" })).toHaveAttribute("href", "/usuarios/prestadores/2");
    expect(screen.getByRole("cell", { name: "$ 20.000,00" })).toBeInTheDocument();
    expect(screen.getByText("Seña")).toBeInTheDocument();
    expect(screen.getByText("Pagado")).toBeInTheDocument();
    expect(container.querySelector('time[datetime="2026-09-20T10:00:00Z"]')).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Composición financiera" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Neto del prestador" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Comisión de plataforma" })).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Ver desglose y referencias" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Detalle del pago" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByText("0f8fad5b-d9cb-469f-a165-70867728950e")).toBeInTheDocument();
    expect(within(dialog).getByText("ID de cliente")).toBeInTheDocument();
    expect(within(dialog).getByText("ID de prestador")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(await screen.findByRole("button", { name: "Ver desglose y referencias" })).toHaveFocus();
  });

  it("uses names as profile links and exposes the canonical operation link in details", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole("button", { name: "Ver desglose y referencias" }));
    const dialog = await screen.findByRole("dialog", { name: "Detalle del pago" });
    expect(within(dialog).getByRole("link", { name: "jr-123" })).toHaveAttribute("href", "/operaciones/jr-123");
  });

  it("does not infer an operation link from the service proposal ID", async () => {
    const user = userEvent.setup();
    render(<PaymentsTable items={[paymentFixture({ serviceProposalId: 123 })]} />);
    await user.click(screen.getByRole("button", { name: "Ver desglose y referencias" }));

    const dialog = await screen.findByRole("dialog", { name: "Detalle del pago" });
    expect(within(dialog).queryByRole("link", { name: /Operación/ })).not.toBeInTheDocument();
  });

  it("opens the financial context and keeps processor settlement separate from the assigned seller amount", async () => {
    const user = userEvent.setup();
    render(<PaymentsTable items={[paymentFixture()]} />);

    await user.click(screen.getByRole("button", { name: "Ver desglose y referencias" }));

    expect(screen.getByText("Cobros aprobados por el procesador")).toBeInTheDocument();
    expect(screen.getAllByText("$ 20.000,00").length).toBeGreaterThan(1);
    expect(screen.getByText("Monto asignado al prestador para este pago")).toBeInTheDocument();
    expect(screen.getByText("No representa una liquidación confirmada.")).toBeInTheDocument();
    expect(screen.getByText("Liquidación neta informada por el procesador")).toBeInTheDocument();
    expect(screen.getAllByText("No informado").length).toBeGreaterThan(0);
    expect(screen.getByText("pay_1001")).toBeInTheDocument();
    expect(screen.getByText("Importe de seña del servicio")).toBeInTheDocument();
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
