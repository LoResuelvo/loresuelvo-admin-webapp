import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import {
  samplePaymentsResponse,
  samplePendingPaymentResponse,
  sampleMultiplePaymentsResponse,
} from "./payments_fixtures";

export { samplePaymentsResponse, samplePendingPaymentResponse, sampleMultiplePaymentsResponse };

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

Given(
  "que la consulta de transacciones financieras toma unos momentos",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/payments",
      status: 200,
      body: samplePaymentsResponse,
      delayMs: 3000,
    });
  },
);

Given(
  "que existen pagos registrados vinculados a operaciones del marketplace",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/payments", samplePaymentsResponse);
    const paymentsPath = (ROUTES as unknown as Record<string, string>).payments ?? "/pagos";
    await this.page.goto(new URL(paymentsPath, this.appUrl).href);
  },
);

When(
  "realizo una búsqueda por la referencia {string}",
  async function (this: CustomWorld, reference: string) {
    const searchInput = this.page
      .getByRole("searchbox", { name: /buscar por referencia o participante/i })
      .or(this.page.getByPlaceholder(/buscar por referencia o participante/i))
      .or(this.page.locator("#payments-search"));
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(reference);
  },
);

Then(
  "el listado contiene únicamente la transacción vinculada a esa referencia",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 1);
    const text = await rows.first().innerText();
    assert.ok(text.includes("MP-REF-45892"));
    assert.ok(text.includes("Juan Pérez"));
    assert.ok(!text.includes("MP-REF-45891"));
  },
);

Given(
  "que existen múltiples pagos registrados de señas y saldos",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/payments", sampleMultiplePaymentsResponse);
    const paymentsPath = (ROUTES as unknown as Record<string, string>).payments ?? "/pagos";
    await this.page.goto(new URL(paymentsPath, this.appUrl).href);
  },
);

When(
  "aplico los filtros para ver pagos de seña con estado aprobado",
  async function (this: CustomWorld) {
    const purposeSelect = this.page.getByRole("combobox", { name: /propósito/i });
    await purposeSelect.waitFor({ state: "visible" });
    await purposeSelect.selectOption("deposit");

    const statusSelect = this.page.getByRole("combobox", { name: /estado/i });
    await statusSelect.waitFor({ state: "visible" });
    await statusSelect.selectOption("approved");
  },
);

Then(
  "el listado muestra exclusivamente los cobros de seña que se encuentran aprobados",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 1);
    const text = await rows.first().innerText();
    assert.ok(text.includes("Seña") || text.includes("deposit"));
    assert.ok(text.includes("Aprobado"));
    assert.ok(text.includes("María Gómez"));
    assert.ok(!text.includes("Juan Pérez"));
  },
);
