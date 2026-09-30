import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import {
  mockFunnelData,
  mockFunnel30Days,
  mockFunnelPlomeria,
  mockEmptyFunnel,
  expectedSteps,
  mockCategories,
} from "./operational_funnel_fixtures";
import { computeDateRange, type PeriodOption } from "../../domain/metrics/funnel-date-range";

function funnelEndpoint(from: string, to: string, categoryId?: number): string {
  const params = new URLSearchParams({ from, to });
  if (categoryId) params.set("category_id", String(categoryId));
  return `/admin/metrics/funnel?${params.toString()}`;
}

function defaultFunnelEndpoint(preset: PeriodOption = "7d", categoryId?: number): string {
  const { from, to } = computeDateRange(preset);
  return funnelEndpoint(from, to, categoryId);
}

Given("que existen datos de operaciones registradas en el marketplace", async function (this: CustomWorld) {
  await this.stubGet(defaultFunnelEndpoint(), mockFunnelData);
});

When("accedo a la sección de métricas en {string}", async function (this: CustomWorld, path: string) {
  await this.page.goto(new URL(path, this.appUrl).href);
});

Then(
  "visualizo las etapas del embudo desde el diagnóstico hasta la reseña con sus volúmenes y la tasa de conversión global",
  async function (this: CustomWorld) {
    const page = this.page;
    const globalRate = page.getByTestId("global-conversion-rate");
    await globalRate.waitFor({ state: "visible", timeout: 10000 });
    const globalText = await globalRate.textContent();
    assert.match(globalText ?? "", /32/);

    for (const step of expectedSteps) {
      const stepElement = page.getByTestId(step.testId);
      await stepElement.waitFor({ state: "visible", timeout: 10000 });
      const text = await stepElement.textContent();
      assert.ok(text?.includes(step.label), `Expected label "${step.label}", got: "${text}"`);
      assert.ok(text?.includes(step.count), `Expected count "${step.count}", got: "${text}"`);
    }
  },
);

Given("que el embudo de contratación muestra las transiciones entre etapas", async function (this: CustomWorld) {
  await this.stubGet(defaultFunnelEndpoint(), mockFunnelData);
  await this.page.goto(new URL("/metricas", this.appUrl).href);
  const funnelSection = this.page.getByRole("region", { name: "Detalle de etapas del embudo" });
  await funnelSection.waitFor({ state: "visible", timeout: 10000 });
});

When("inspecciono el paso de solicitudes a propuestas", async function (this: CustomWorld) {
  const stepElement = this.page.getByTestId("funnel-step-proposals_sent");
  await stepElement.waitFor({ state: "visible", timeout: 10000 });
  await stepElement.scrollIntoViewIfNeeded();
});

Then(
  "visualizo el porcentaje de conversión relativo y el tiempo promedio transcurrido entre ambos hitos",
  async function (this: CustomWorld) {
    const stepElement = this.page.getByTestId("funnel-step-proposals_sent");
    await stepElement.waitFor({ state: "visible", timeout: 10000 });

    const retention = stepElement.getByTestId("retention-proposals_sent");
    await retention.waitFor({ state: "visible", timeout: 10000 });
    const retentionText = await retention.textContent();
    assert.match(retentionText ?? "", /77%/);

    const duration = stepElement.getByTestId("duration-proposals_sent");
    await duration.waitFor({ state: "visible", timeout: 10000 });
    const durationText = await duration.textContent();
    assert.match(durationText ?? "", /4\s*h/);
  },
);

Given("que me encuentro en la consola de métricas", async function (this: CustomWorld) {
  await this.stubGet(defaultFunnelEndpoint(), mockFunnelData);
  await this.stubGet(defaultFunnelEndpoint("30d"), mockFunnel30Days);
  await this.page.goto(new URL("/metricas", this.appUrl).href);
  const heading = this.page.getByRole("heading", { name: "Métricas de Conversión Operativa" });
  await heading.waitFor({ state: "visible", timeout: 10000 });
});

When("selecciono el rango temporal {string}", async function (this: CustomWorld, period: string) {
  const rangeSelect = this.page
    .getByRole("combobox", { name: /rango temporal|período/i })
    .or(this.page.getByLabel(/rango temporal|período/i))
    .or(this.page.getByTestId("metrics-period-select"));
  await rangeSelect.waitFor({ state: "visible", timeout: 10000 });
  await rangeSelect.selectOption({ label: period });
});

Then(
  "los indicadores y el gráfico del embudo se actualizan reflejando exclusivamente el período seleccionado",
  async function (this: CustomWorld) {
    const globalRate = this.page.getByTestId("global-conversion-rate");
    await globalRate.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="global-conversion-rate"]');
        return el && el.textContent?.includes("45");
      },
      null,
      { timeout: 10000 },
    );
    const globalText = await globalRate.textContent();
    assert.match(globalText ?? "", /45/);

    const stepElement = this.page.getByTestId("funnel-step-ai_diagnostics");
    const countText = await stepElement.textContent();
    assert.match(countText ?? "", /320/);
  },
);

Given("que el marketplace abarca diversos oficios", async function (this: CustomWorld) {
  await this.stubGet("/categories", mockCategories);
  await this.stubGet("/admin/categories", mockCategories);
  await this.stubGet(defaultFunnelEndpoint(), mockFunnelData);
  await this.stubGet(defaultFunnelEndpoint("7d", 47), mockFunnelPlomeria);
  await this.page.goto(new URL("/metricas", this.appUrl).href);
  const heading = this.page.getByRole("heading", { name: "Métricas de Conversión Operativa" });
  await heading.waitFor({ state: "visible", timeout: 10000 });
});

When("filtro el embudo por el rubro {string}", async function (this: CustomWorld, rubro: string) {
  const categorySelect = this.page
    .getByRole("combobox", { name: /rubro|oficio/i })
    .or(this.page.getByLabel(/rubro|oficio/i))
    .or(this.page.getByTestId("metrics-category-select"));
  await categorySelect.waitFor({ state: "visible", timeout: 10000 });
  await categorySelect.selectOption({ label: rubro });
});

Then(
  "las etapas reflejan las métricas de conversión exclusivas de contrataciones de plomería",
  async function (this: CustomWorld) {
    const globalRate = this.page.getByTestId("global-conversion-rate");
    await globalRate.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="global-conversion-rate"]');
        return el && el.textContent?.includes("28");
      },
      null,
      { timeout: 10000 },
    );
    const globalText = await globalRate.textContent();
    assert.match(globalText ?? "", /28/);

    const stepElement = this.page.getByTestId("funnel-step-ai_diagnostics");
    const countText = await stepElement.textContent();
    assert.match(countText ?? "", /95/);
  },
);

Given("que selecciono un rango de fechas sin actividad registrada", async function (this: CustomWorld) {
  await this.stubGet(defaultFunnelEndpoint(), mockFunnelData);
  await this.stubGet(funnelEndpoint("2020-01-01", "2020-01-31"), mockEmptyFunnel);
  await this.page.goto(new URL("/metricas", this.appUrl).href);
  const heading = this.page.getByRole("heading", { name: "Métricas de Conversión Operativa" });
  await heading.waitFor({ state: "visible", timeout: 10000 });

  const fromInput = this.page.getByLabel(/fecha desde|desde/i).or(this.page.getByTestId("metrics-from-date"));
  await fromInput.waitFor({ state: "visible", timeout: 10000 });
  await fromInput.fill("2020-01-01");

  const toInput = this.page.getByLabel(/fecha hasta|hasta/i).or(this.page.getByTestId("metrics-to-date"));
  await toInput.waitFor({ state: "visible", timeout: 10000 });
  await toInput.fill("2020-01-31");
});

When("aplico el filtro en la sección de métricas", async function (this: CustomWorld) {
  const applyButton = this.page.getByRole("button", { name: /aplicar/i }).or(this.page.getByTestId("metrics-apply-filters"));
  await applyButton.waitFor({ state: "visible", timeout: 10000 });
  await applyButton.click();
});

Then(
  "se presenta un mensaje informativo indicando que no hay suficiente volumen para generar el embudo",
  async function (this: CustomWorld) {
    const emptyState = this.page.getByTestId("funnel-empty-state");
    await emptyState.waitFor({ state: "visible", timeout: 10000 });
    const text = await emptyState.textContent();
    assert.ok(
      text?.includes("No hay suficiente volumen para generar el embudo"),
      `Expected empty message, got: "${text}"`,
    );
  },
);

Given("que el cálculo analítico de las métricas toma unos momentos", async function (this: CustomWorld) {
  await this.addApiStub({
    method: "GET",
    endpoint: defaultFunnelEndpoint(),
    status: 200,
    body: mockFunnelData,
    delayMs: 3000,
  });
});

When("accedo a la sección de métricas", async function (this: CustomWorld) {
  await this.page.goto(new URL("/metricas", this.appUrl).href, {
    waitUntil: "commit",
  });
});

Then(
  "se presenta una vista de carga con indicadores visuales mientras se procesan las agregaciones",
  async function (this: CustomWorld) {
    const skeleton = this.page.getByTestId("metrics-skeleton");
    await skeleton.waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await skeleton.getAttribute("role"), "status");
    assert.equal(await skeleton.getAttribute("aria-busy"), "true");

    const indicators = this.page.getByTestId("skeleton-indicator");
    const count = await indicators.count();
    assert.ok(count > 0, "Expected at least one skeleton indicator");
  },
);

Given("que mi cuenta de usuario no posee permisos de analítica", async function (this: CustomWorld) {
  await this.stubGet(
    defaultFunnelEndpoint(),
    { error: "Forbidden", message: "User lacks read:admin_metrics permission" },
    403,
  );
});

When("intento ingresar a la sección de métricas", async function (this: CustomWorld) {
  await this.page.goto(new URL("/metricas", this.appUrl).href);
});

Given("que el servidor de métricas no se encuentra disponible", async function (this: CustomWorld) {
  await this.stubGet(
    defaultFunnelEndpoint(),
    { error: "Internal Server Error", message: "Database connection failed" },
    500,
  );
});

When("intento consultar la consola de métricas", async function (this: CustomWorld) {
  await this.page.goto(new URL("/metricas", this.appUrl).href);
});

