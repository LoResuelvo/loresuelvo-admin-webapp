import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

export const samplePaymentsResponse = {
  items: [
    {
      id: 1,
      external_payment_id: "pay_1001",
      external_reference: "MP-REF-45891",
      purpose: "deposit",
      status: "approved",
      service_proposal_id: 101,
      work_order_id: null,
      consumer: {
        id: 1,
        name: "María Gómez",
        email: "maria.gomez@example.com",
      },
      provider: {
        id: 2,
        name: "Carlos Plomero",
        email: "carlos.plomero@example.com",
      },
      currency: "ARS",
      service_amount_cents: 2000000,
      seller_amount_cents: 1700000,
      platform_fee_cents: 300000,
      total_amount_cents: 2000000,
      created_at: "2026-09-20T10:00:00Z",
      verified_at: "2026-09-20T10:05:00Z",
    },
    {
      id: 2,
      external_payment_id: "pay_1002",
      external_reference: "MP-REF-45892",
      purpose: "balance",
      status: "approved",
      service_proposal_id: null,
      work_order_id: 201,
      consumer: {
        id: 3,
        name: "Juan Pérez",
        email: "juan.perez@example.com",
      },
      provider: {
        id: 4,
        name: "Ana Electricista",
        email: "ana.electricista@example.com",
      },
      currency: "ARS",
      service_amount_cents: 5000000,
      seller_amount_cents: 4250000,
      platform_fee_cents: 750000,
      total_amount_cents: 5000000,
      created_at: "2026-09-21T15:30:00Z",
      verified_at: "2026-09-21T15:35:00Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    total_pages: 1,
  },
};

Given(
  "que existen transacciones registradas de señas y saldos en el sistema",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/payments", samplePaymentsResponse);
  },
);

When("accedo a la sección de pagos", async function (this: CustomWorld) {
  const paymentsPath = (ROUTES as unknown as Record<string, string>).payments ?? "/pagos";
  await this.page.goto(new URL(paymentsPath, this.appUrl).href);
});

Then(
  "visualizo el listado de transacciones con el propósito, cliente, prestador, total del servicio, neto del prestador, comisión de plataforma y estado",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    const row0 = rows.nth(0);
    const text0 = await row0.innerText();
    assert.ok(text0.includes("Seña") || text0.includes("deposit"));
    assert.ok(text0.includes("María Gómez"));
    assert.ok(text0.includes("Carlos Plomero"));
    assert.ok(text0.includes("20.000") || text0.includes("20000"));
    assert.ok(text0.includes("17.000") || text0.includes("17000"));
    assert.ok(text0.includes("3.000") || text0.includes("3000"));
    assert.ok(text0.includes("Aprobado"));

    const row1 = rows.nth(1);
    const text1 = await row1.innerText();
    assert.ok(text1.includes("Saldo") || text1.includes("balance"));
    assert.ok(text1.includes("Juan Pérez"));
    assert.ok(text1.includes("Ana Electricista"));
    assert.ok(text1.includes("50.000") || text1.includes("50000"));
    assert.ok(text1.includes("42.500") || text1.includes("42500"));
    assert.ok(text1.includes("7.500") || text1.includes("7500"));
    assert.ok(text1.includes("Aprobado"));
  },
);

export const samplePendingPaymentResponse = {
  items: [
    {
      id: 3,
      external_payment_id: "pay_pending_1003",
      external_reference: "MP-REF-45893",
      purpose: "deposit",
      status: "pending",
      service_proposal_id: 103,
      work_order_id: null,
      consumer: {
        id: 5,
        name: "Valeria Rossi",
        email: "valeria.rossi@example.com",
      },
      provider: {
        id: 6,
        name: "Esteban Carpintero",
        email: "esteban.carpintero@example.com",
      },
      currency: "ARS",
      service_amount_cents: 3500000,
      seller_amount_cents: 2975000,
      platform_fee_cents: 525000,
      total_amount_cents: 3500000,
      created_at: "2026-09-22T11:00:00Z",
      verified_at: null,
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    total_pages: 1,
  },
};

Given(
  "que existe una transacción con checkout iniciado pero pendiente de cobro",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/payments", samplePendingPaymentResponse);
  },
);

When("consulto el listado en la sección de pagos", async function (this: CustomWorld) {
  const paymentsPath = (ROUTES as unknown as Record<string, string>).payments ?? "/pagos";
  await this.page.goto(new URL(paymentsPath, this.appUrl).href);
});

Then(
  "el pago se visualiza con estado pendiente sin computarse como cobro acreditado",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 1);

    const row = rows.nth(0);
    const rowText = await row.innerText();
    assert.ok(rowText.toLowerCase().includes("pendiente"));
    assert.ok(
      rowText.toLowerCase().includes("no computado como cobro acreditado") ||
      rowText.toLowerCase().includes("sin computar"),
    );
  },
);
