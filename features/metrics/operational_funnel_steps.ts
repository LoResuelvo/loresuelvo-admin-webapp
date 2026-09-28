import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";

const mockFunnelData = {
  time_range: { from: "2026-08-25", to: "2026-09-24" },
  global_conversion_rate: 0.32,
  steps: [
    { step_name: "ai_diagnostics", count: 250, relative_conversion: 1.0, avg_duration_minutes: null },
    { step_name: "requests_created", count: 180, relative_conversion: 0.72, avg_duration_minutes: 15 },
    { step_name: "proposals_sent", count: 140, relative_conversion: 0.77, avg_duration_minutes: 240 },
    { step_name: "deposits_paid", count: 105, relative_conversion: 0.75, avg_duration_minutes: 360 },
    { step_name: "orders_completed", count: 88, relative_conversion: 0.83, avg_duration_minutes: 2880 },
    { step_name: "reviews_submitted", count: 80, relative_conversion: 0.90, avg_duration_minutes: 1440 },
  ],
};

Given(
  "que existen datos de operaciones registradas en el marketplace",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/metrics/funnel", mockFunnelData);
  },
);

When(
  "accedo a la sección de métricas en {string}",
  async function (this: CustomWorld, path: string) {
    await this.page.goto(new URL(path, this.appUrl).href);
  },
);

Then(
  "visualizo las etapas del embudo desde el diagnóstico hasta la reseña con sus volúmenes y la tasa de conversión global",
  async function (this: CustomWorld) {
    const page = this.page;

    const globalRate = page.getByTestId("global-conversion-rate");
    await globalRate.waitFor({ state: "visible", timeout: 10000 });
    const globalText = await globalRate.textContent();
    assert.match(globalText ?? "", /32/);

    const expectedSteps = [
      { testId: "funnel-step-ai_diagnostics", label: "Diagnósticos IA", count: "250" },
      { testId: "funnel-step-requests_created", label: "Solicitudes publicadas", count: "180" },
      { testId: "funnel-step-proposals_sent", label: "Propuestas comerciales", count: "140" },
      { testId: "funnel-step-deposits_paid", label: "Señas pagadas", count: "105" },
      { testId: "funnel-step-orders_completed", label: "Órdenes concluidas", count: "88" },
      { testId: "funnel-step-reviews_submitted", label: "Reseñas enviadas", count: "80" },
    ];

    for (const step of expectedSteps) {
      const stepElement = page.getByTestId(step.testId);
      await stepElement.waitFor({ state: "visible", timeout: 10000 });
      const text = await stepElement.textContent();
      assert.ok(
        text?.includes(step.label),
        `Expected step "${step.testId}" to contain label "${step.label}", got: "${text}"`,
      );
      assert.ok(
        text?.includes(step.count),
        `Expected step "${step.testId}" to contain count "${step.count}", got: "${text}"`,
      );
    }
  },
);

Given(
  "que el embudo de contratación muestra las transiciones entre etapas",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/metrics/funnel", mockFunnelData);
    await this.page.goto(new URL("/metricas", this.appUrl).href);
    const funnelSection = this.page.getByRole("region", {
      name: "Detalle de etapas del embudo",
    });
    await funnelSection.waitFor({ state: "visible", timeout: 10000 });
  },
);

When(
  "inspecciono el paso de solicitudes a propuestas",
  async function (this: CustomWorld) {
    const stepElement = this.page.getByTestId("funnel-step-proposals_sent");
    await stepElement.waitFor({ state: "visible", timeout: 10000 });
    await stepElement.scrollIntoViewIfNeeded();
  },
);

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

const mockFunnel30Days = {
  time_range: { from: "2026-08-25", to: "2026-09-24" },
  global_conversion_rate: 0.45,
  steps: [
    { step_name: "ai_diagnostics", count: 320, relative_conversion: 1.0, avg_duration_minutes: null },
    { step_name: "requests_created", count: 240, relative_conversion: 0.75, avg_duration_minutes: 12 },
    { step_name: "proposals_sent", count: 190, relative_conversion: 0.79, avg_duration_minutes: 200 },
    { step_name: "deposits_paid", count: 160, relative_conversion: 0.84, avg_duration_minutes: 300 },
    { step_name: "orders_completed", count: 150, relative_conversion: 0.94, avg_duration_minutes: 2400 },
    { step_name: "reviews_submitted", count: 144, relative_conversion: 0.96, avg_duration_minutes: 1200 },
  ],
};

Given(
  "que me encuentro en la consola de métricas",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/metrics/funnel", mockFunnelData);
    await this.stubGet("/admin/metrics/funnel?from=2026-08-25&to=2026-09-24", mockFunnel30Days);
    await this.stubGet("/admin/metrics/funnel?range=30d", mockFunnel30Days);
    await this.page.goto(new URL("/metricas", this.appUrl).href);
    const heading = this.page.getByRole("heading", {
      name: "Métricas de Conversión Operativa",
    });
    await heading.waitFor({ state: "visible", timeout: 10000 });
  },
);

When(
  "selecciono el rango temporal {string}",
  async function (this: CustomWorld, period: string) {
    const rangeSelect = this.page
      .getByRole("combobox", { name: /rango temporal|período/i })
      .or(this.page.getByLabel(/rango temporal|período/i))
      .or(this.page.getByTestId("metrics-period-select"));
    await rangeSelect.waitFor({ state: "visible", timeout: 10000 });
    await rangeSelect.selectOption({ label: period });
  },
);

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

