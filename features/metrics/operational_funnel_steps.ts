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
