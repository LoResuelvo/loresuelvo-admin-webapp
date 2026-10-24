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
  "visualizo el propósito, total y estado de intención en el listado, y consulto en el detalle los IDs, neto, comisión y desglose económico",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    const row0 = rows.nth(0);
    const summary0 = await row0.innerText();
    assert.ok(summary0.includes("Seña"));
    assert.ok(summary0.includes("20.000") || summary0.includes("20000"));
    assert.ok(summary0.includes("Pagado"));
    await row0.getByRole("link", { name: "Cliente #1", exact: true }).waitFor();
    await row0.getByRole("link", { name: "Prestador #2", exact: true }).waitFor();
    await row0.getByRole("button", { name: "Ver desglose y referencias" }).click();
    const detail0 = this.page.getByRole("dialog");
    await detail0.waitFor({ state: "visible" });
    await detail0.getByRole("heading", { name: "Detalle del pago" }).waitFor();
    const text0 = await detail0.innerText();
    assert.ok(text0.includes("#1"));
    assert.ok(text0.includes("#2"));
    assert.ok(text0.includes("20.000") || text0.includes("20000"));
    assert.ok(text0.includes("Monto asignado al prestador"));
    assert.ok(text0.includes("No representa una liquidación confirmada."));
    assert.ok(text0.includes("17.000") || text0.includes("17000"));
    assert.ok(text0.includes("3.000") || text0.includes("3000"));
    await this.page.keyboard.press("Escape");
    await detail0.waitFor({ state: "hidden" });

    const row1 = rows.nth(1);
    const summary1 = await row1.innerText();
    assert.ok(summary1.includes("Saldo del servicio"));
    assert.ok(summary1.includes("50.000") || summary1.includes("50000"));
    assert.ok(summary1.includes("Pagado"));
    await row1.getByRole("link", { name: "Cliente #3", exact: true }).waitFor();
    await row1.getByRole("link", { name: "Prestador #4", exact: true }).waitFor();
    await row1.getByRole("button", { name: "Ver desglose y referencias" }).click();
    const detail1 = this.page.getByRole("dialog");
    await detail1.waitFor({ state: "visible" });
    await detail1.getByRole("heading", { name: "Detalle del pago" }).waitFor();
    const text1 = await detail1.innerText();
    assert.ok(text1.includes("#3"));
    assert.ok(text1.includes("#4"));
    assert.ok(text1.includes("50.000") || text1.includes("50000"));
    assert.ok(text1.includes("Monto asignado al prestador"));
    assert.ok(text1.includes("No representa una liquidación confirmada."));
    assert.ok(text1.includes("42.500") || text1.includes("42500"));
    assert.ok(text1.includes("7.500") || text1.includes("7500"));
    await this.page.keyboard.press("Escape");
    await detail1.waitFor({ state: "hidden" });
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
    assert.ok(rowText.toLowerCase().includes("en proceso"));
    assert.ok(
      rowText.toLowerCase().includes("sin cobro acreditado"),
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
  "realizo una búsqueda por el ID de intención {string}",
  async function (this: CustomWorld, paymentId: string) {
    const searchField = this.page.getByRole("combobox", { name: "Buscar por" });
    await searchField.selectOption("paymentIntentId");
    const searchInput = this.page
      .getByRole("searchbox", { name: /buscar pagos/i })
      .or(this.page.locator("#payments-search"));
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(paymentId);
    await this.page.getByRole("button", { name: "Buscar" }).click();
  },
);

Then(
  "el listado contiene únicamente la intención de pago con ese ID",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    await this.page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 1);
    const rows = this.page.locator("tbody tr");
    assert.equal(await rows.count(), 1);
    await rows.first().getByRole("link", { name: "Cliente #3", exact: true }).waitFor();
    await rows.first().getByRole("button", { name: "Ver desglose y referencias" }).click();
    const detail = this.page.getByRole("dialog");
    await detail.waitFor({ state: "visible" });
    await detail.getByText("d9428888-122b-11e1-b85c-61cd3cbb3210", { exact: true }).waitFor();
    assert.equal(await detail.getByText("0f8fad5b-d9cb-469f-a165-70867728950e", { exact: true }).count(), 0);
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
  "aplico los filtros para ver señas con estado pagado",
  async function (this: CustomWorld) {
    const purposeSelect = this.page.getByRole("combobox", { name: /propósito/i });
    await purposeSelect.waitFor({ state: "visible" });
    await purposeSelect.selectOption("booking_deposit");

    const statusSelect = this.page.getByRole("combobox", { name: /estado/i });
    await statusSelect.waitFor({ state: "visible" });
    await statusSelect.selectOption("paid");
  },
);

Then(
  "el listado muestra exclusivamente las intenciones de seña que se encuentran pagadas",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    await this.page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 1);
    const rows = this.page.locator("tbody tr");
    assert.equal(await rows.count(), 1);
    const text = await rows.first().innerText();
    assert.ok(text.includes("Seña"));
    assert.ok(text.includes("Pagado"));
    assert.ok(text.includes("#1"));
    assert.ok(!text.includes("#3"));
  },
);

Given(
  "que no existen transacciones que coincidan con el criterio seleccionado",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/payments", samplePaymentsResponse);
    const paymentsPath = (ROUTES as unknown as Record<string, string>).payments ?? "/pagos";
    await this.page.goto(new URL(paymentsPath, this.appUrl).href);
  },
);

When(
  "aplico un filtro de búsqueda sin resultados en la sección de pagos",
  async function (this: CustomWorld) {
    const searchField = this.page.getByRole("combobox", { name: "Buscar por" });
    await searchField.selectOption("paymentIntentId");
    const searchInput = this.page
      .getByRole("searchbox", { name: /buscar pagos/i })
      .or(this.page.locator("#payments-search"));
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    await this.page.getByRole("button", { name: "Buscar" }).click();
  },
);

Then(
  "se muestra un mensaje informativo indicando que no hay transacciones disponibles",
  async function (this: CustomWorld) {
    const emptyState = this.page.getByTestId("payments-empty");
    await emptyState.waitFor({ state: "visible" });
    const text = await emptyState.innerText();
    assert.ok(text.includes("No hay transacciones disponibles"));
  },
);

Given(
  "que mi cuenta de usuario no posee permisos para consultar información financiera",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/payments", { error: "Forbidden" }, 403);
  },
);

When("intento ingresar a la sección de pagos", async function (this: CustomWorld) {
  const paymentsPath = (ROUTES as unknown as Record<string, string>).payments ?? "/pagos";
  await this.page.goto(new URL(paymentsPath, this.appUrl).href);
});

When("intento consultar la sección de pagos", async function (this: CustomWorld) {
  const paymentsPath = (ROUTES as unknown as Record<string, string>).payments ?? "/pagos";
  await this.page.goto(new URL(paymentsPath, this.appUrl).href);
});

Then(
  "se presenta un aviso informando el inconveniente con la opción de reintentar la carga",
  async function (this: CustomWorld) {
    const errorAlert = this.page.getByRole("alert").filter({
      hasText: /error|inconveniente|problema/i,
    });
    await errorAlert.waitFor({ state: "visible", timeout: 5000 });
    assert.ok(await errorAlert.isVisible());

    const retryButton = this.page.getByRole("button", { name: /reintentar/i });
    await retryButton.waitFor({ state: "visible", timeout: 5000 });
    assert.ok(await retryButton.isVisible());
  },
);

