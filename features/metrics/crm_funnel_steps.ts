import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { computeDateRange, type PeriodOption } from "../../domain/metrics/funnel-date-range";
import { CustomWorld } from "../support/world";
import {
  crmAiAndManualFunnelFixture,
  crmAiFunnelFixture,
  crmComparisonFunnelFixture,
  crmZeroBaseAndZeroProgressFixture,
} from "./crm_funnel_fixtures";

function funnelEndpoint(from: string, to: string, categoryId?: number): string {
  const params = new URLSearchParams({ from, to });
  if (categoryId) params.set("category_id", String(categoryId));
  return `/admin/metrics/funnel?${params.toString()}`;
}

function defaultFunnelEndpoint(preset: PeriodOption = "7d", categoryId?: number): string {
  const { from, to } = computeDateRange(preset);
  return funnelEndpoint(from, to, categoryId);
}

Given(
  "que una cohorte IA contiene 100 evaluaciones profesionales, 60 con solicitud y 30 con propuesta",
  async function (this: CustomWorld) {
    await this.stubGet(defaultFunnelEndpoint(), crmAiFunnelFixture);
  },
);

When("consulto el recorrido Origen IA", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.metrics, this.appUrl).href);
});

Then(
  "veo 100%, 60% y 30% sobre las evaluaciones iniciales",
  async function (this: CustomWorld) {
    for (const [stepName, percentage] of [
      ["ai_diagnostics", "100%"],
      ["requests_created", "60%"],
      ["proposals_sent", "30%"],
    ]) {
      const step = this.page.getByTestId(`funnel-step-${stepName}`);
      await step.waitFor({ state: "visible", timeout: 10000 });
      assert.ok((await step.textContent())?.includes(percentage));
    }
  },
);

Then(
  "veo 60% y 50% de avance desde la etapa anterior con sus denominadores",
  async function (this: CustomWorld) {
    const requests = this.page.getByTestId("funnel-step-requests_created");
    const proposals = this.page.getByTestId("funnel-step-proposals_sent");
    await requests.waitFor({ state: "visible", timeout: 10000 });
    await proposals.waitFor({ state: "visible", timeout: 10000 });

    assert.ok((await requests.textContent())?.includes("60 de 100"));
    assert.ok((await proposals.textContent())?.includes("30 de 60"));
  },
);

Then(
  "las barras usan exclusivamente el porcentaje sobre el inicio",
  async function (this: CustomWorld) {
    for (const [stepName, width] of [
      ["ai_diagnostics", "100%"],
      ["requests_created", "60%"],
      ["proposals_sent", "30%"],
    ]) {
      const bar = this.page.getByTestId(`funnel-chart-bar-${stepName}`);
      await bar.waitFor({ state: "visible", timeout: 10000 });
      assert.equal(await bar.getAttribute("aria-valuenow"), width.replace("%", ""));
    }
  },
);

Then(
  "se identifica que la unidad contada es la evaluación profesional",
  async function (this: CustomWorld) {
    const unit = this.page.getByTestId("funnel-initial-unit");
    await unit.waitFor({ state: "visible", timeout: 10000 });
    assert.match((await unit.textContent()) ?? "", /evaluación profesional/i);
  },
);

Given(
  "que la respuesta contiene solicitudes manuales y evaluaciones de origen IA",
  async function (this: CustomWorld) {
    await this.stubGet(defaultFunnelEndpoint(), crmAiAndManualFunnelFixture);
  },
);

When("selecciono el recorrido Manual", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.metrics, this.appUrl).href);
  const source = this.page.getByRole("combobox", { name: "Origen" });
  await source.waitFor({ state: "visible", timeout: 10000 });
  await source.selectOption("manual");
});

Then(
  "veo únicamente las solicitudes manuales y sus hitos desde solicitud hasta reseña",
  async function (this: CustomWorld) {
    assert.equal(
      await this.page.getByTestId("funnel-step-ai_diagnostics").count(),
      0,
    );
    for (const stepName of [
      "requests_created",
      "proposals_sent",
      "deposits_paid",
      "orders_completed",
      "full_payments",
      "reviews_submitted",
    ]) {
      const step = this.page.getByTestId(`funnel-step-${stepName}`);
      await step.waitFor({ state: "visible", timeout: 10000 });
    }

    assert.ok(
      (await this.page.getByTestId("funnel-step-requests_created").textContent())
        ?.includes("3"),
    );
    assert.match(
      (await this.page.getByTestId("funnel-initial-unit").textContent()) ?? "",
      /solicitud manual/i,
    );
  },
);

Then(
  "sus porcentajes usan sus propias solicitudes como base inicial",
  async function (this: CustomWorld) {
    const requestBar = this.page.getByTestId("funnel-chart-bar-requests_created");
    const proposalBar = this.page.getByTestId("funnel-chart-bar-proposals_sent");
    await requestBar.waitFor({ state: "visible", timeout: 10000 });
    await proposalBar.waitFor({ state: "visible", timeout: 10000 });

    assert.equal(await requestBar.getAttribute("aria-valuenow"), "100");
    assert.equal(await proposalBar.getAttribute("aria-valuenow"), "67");
    assert.ok(
      (await this.page.getByTestId("retention-proposals_sent").textContent())
        ?.includes("2 de 3"),
    );
  },
);

Then(
  "el indicador global identifica su numerador y denominador",
  async function (this: CustomWorld) {
    const overview = this.page.getByRole("region", {
      name: "Resumen de conversión global",
    });
    await overview.waitFor({ state: "visible", timeout: 10000 });

    const text = await overview.textContent();
    assert.ok(text?.includes("Finalizaciones reportadas: 1"));
    assert.ok(text?.includes("Base inicial: 3 solicitudes manuales"));
  },
);

Given(
  "que una evaluación origina dos solicitudes y existen tres solicitudes manuales creadas en el mismo período",
  async function (this: CustomWorld) {
    await this.stubGet(defaultFunnelEndpoint(), crmComparisonFunnelFixture);
  },
);

Given(
  "existen avances posteriores al fin del período y varias propuestas para una misma solicitud",
  async function (this: CustomWorld) {
    // Advancements and proposal counts are encapsulated in the fixture
  },
);

When("selecciono Comparar", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.metrics, this.appUrl).href);
  const source = this.page.getByRole("combobox", { name: "Origen" });
  await source.waitFor({ state: "visible", timeout: 10000 });
  await source.selectOption("comparison");
});

Then(
  "veo bases de dos solicitudes IA y tres manuales con las mismas etapas y criterio de rubro",
  async function (this: CustomWorld) {
    const aiPanel = this.page.getByTestId("funnel-comparison-panel-ai");
    const manualPanel = this.page.getByTestId("funnel-comparison-panel-manual");
    await aiPanel.waitFor({ state: "visible", timeout: 10000 });
    await manualPanel.waitFor({ state: "visible", timeout: 10000 });

    const aiOverview = aiPanel.getByRole("region", {
      name: "Resumen de conversión global",
    });
    const manualOverview = manualPanel.getByRole("region", {
      name: "Resumen de conversión global",
    });
    assert.ok((await aiOverview.textContent())?.includes("Base inicial: 2 solicitudes IA"));
    assert.ok((await manualOverview.textContent())?.includes("Base inicial: 3 solicitudes manuales"));

    const expectedStages = [
      "requests_created",
      "proposals_sent",
      "deposits_paid",
      "orders_completed",
      "full_payments",
      "reviews_submitted",
    ];

    assert.equal(await aiPanel.getByTestId("funnel-step-ai_diagnostics").count(), 0);
    assert.equal(await manualPanel.getByTestId("funnel-step-ai_diagnostics").count(), 0);

    for (const stage of expectedStages) {
      await aiPanel.getByTestId(`funnel-step-${stage}`).waitFor({ state: "visible", timeout: 10000 });
      await manualPanel.getByTestId(`funnel-step-${stage}`).waitFor({ state: "visible", timeout: 10000 });
    }

    const aiCriterion = aiPanel.getByTestId("funnel-category-criterion-ai");
    const manualCriterion = manualPanel.getByTestId("funnel-category-criterion-manual");
    assert.match((await aiCriterion.textContent()) ?? "", /rubro actual del prestador/i);
    assert.match((await manualCriterion.textContent()) ?? "", /rubro actual del prestador/i);
  },
);

Then(
  "cada solicitud cuenta una sola vez por etapa con sus avances vinculados observados al consultar",
  async function (this: CustomWorld) {
    const aiPanel = this.page.getByTestId("funnel-comparison-panel-ai");
    const manualPanel = this.page.getByTestId("funnel-comparison-panel-manual");

    const aiRequests = aiPanel.getByTestId("funnel-step-requests_created");
    const aiProposals = aiPanel.getByTestId("funnel-step-proposals_sent");
    assert.ok((await aiRequests.textContent())?.includes("2"));
    assert.ok((await aiProposals.textContent())?.includes("1"));

    const manualRequests = manualPanel.getByTestId("funnel-step-requests_created");
    const manualProposals = manualPanel.getByTestId("funnel-step-proposals_sent");
    assert.ok((await manualRequests.textContent())?.includes("3"));
    assert.ok((await manualProposals.textContent())?.includes("2"));
  },
);

Then(
  "cada origen muestra sus propias tasas sobre solicitudes sin mezclar denominadores",
  async function (this: CustomWorld) {
    const aiPanel = this.page.getByTestId("funnel-comparison-panel-ai");
    const manualPanel = this.page.getByTestId("funnel-comparison-panel-manual");

    const aiBarRequests = aiPanel.getByTestId("funnel-chart-bar-requests_created");
    const aiBarProposals = aiPanel.getByTestId("funnel-chart-bar-proposals_sent");
    await aiBarRequests.waitFor({ state: "visible", timeout: 10000 });
    await aiBarProposals.waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await aiBarRequests.getAttribute("aria-valuenow"), "100");
    assert.equal(await aiBarProposals.getAttribute("aria-valuenow"), "50");
    assert.ok(
      (await aiPanel.getByTestId("retention-proposals_sent").textContent())
        ?.includes("1 de 2"),
    );

    const manualBarRequests = manualPanel.getByTestId("funnel-chart-bar-requests_created");
    const manualBarProposals = manualPanel.getByTestId("funnel-chart-bar-proposals_sent");
    await manualBarRequests.waitFor({ state: "visible", timeout: 10000 });
    await manualBarProposals.waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await manualBarRequests.getAttribute("aria-valuenow"), "100");
    assert.equal(await manualBarProposals.getAttribute("aria-valuenow"), "67");
    assert.ok(
      (await manualPanel.getByTestId("retention-proposals_sent").textContent())
        ?.includes("2 de 3"),
    );
  },
);

Then(
  "se informa que el período selecciona la creación de las solicitudes",
  async function (this: CustomWorld) {
    const notice = this.page.getByTestId("funnel-comparison-notice");
    await notice.waitFor({ state: "visible", timeout: 10000 });
    assert.match(
      (await notice.textContent()) ?? "",
      /período.*creación de las solicitudes/i,
    );
  },
);

Given(
  "que una cohorte no tiene casos iniciales y otra tiene casos iniciales sin avances",
  async function (this: CustomWorld) {
    await this.stubGet(defaultFunnelEndpoint(), crmZeroBaseAndZeroProgressFixture);
  },
);

When("consulto sus indicadores", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.metrics, this.appUrl).href);
});

Then(
  "la cohorte vacía muestra conteos cero y porcentajes sin base como no disponibles",
  async function (this: CustomWorld) {
    const source = this.page.getByRole("combobox", { name: "Origen" });
    await source.waitFor({ state: "visible", timeout: 10000 });
    await source.selectOption("manual");

    const emptyState = this.page.getByTestId("funnel-empty-state");
    await emptyState.waitFor({ state: "visible", timeout: 10000 });
    assert.match(
      (await emptyState.textContent()) ?? "",
      /no hay suficiente volumen para generar el embudo/i,
    );

    for (const stepName of [
      "requests_created",
      "proposals_sent",
      "deposits_paid",
      "orders_completed",
      "full_payments",
      "reviews_submitted",
    ]) {
      const step = this.page.getByTestId(`funnel-step-${stepName}`);
      await step.waitFor({ state: "visible", timeout: 10000 });
      const text = (await step.textContent()) ?? "";
      assert.ok(text.includes("0"), `Step ${stepName} should show count 0`);
      assert.match(text, /no disponible/i, `Step ${stepName} should indicate unavailable conversion`);
    }
  },
);

Then(
  "la cohorte con base positiva muestra cero por ciento para las etapas sin avances",
  async function (this: CustomWorld) {
    const source = this.page.getByRole("combobox", { name: "Origen" });
    await source.waitFor({ state: "visible", timeout: 10000 });
    await source.selectOption("ai");

    const initialStep = this.page.getByTestId("funnel-step-ai_diagnostics");
    await initialStep.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await initialStep.textContent())?.includes("100"));

    for (const stepName of [
      "requests_created",
      "proposals_sent",
      "deposits_paid",
      "orders_completed",
      "full_payments",
      "reviews_submitted",
    ]) {
      const step = this.page.getByTestId(`funnel-step-${stepName}`);
      await step.waitFor({ state: "visible", timeout: 10000 });
      const text = (await step.textContent()) ?? "";
      assert.ok(text.includes("0%"), `Step ${stepName} should show 0%`);
    }
  },
);

Then(
  "ninguna barra representa volumen positivo para una etapa con cero casos",
  async function (this: CustomWorld) {
    for (const stepName of [
      "requests_created",
      "proposals_sent",
      "deposits_paid",
      "orders_completed",
      "full_payments",
      "reviews_submitted",
    ]) {
      const chartBar = this.page.getByTestId(`funnel-chart-bar-${stepName}`);
      await chartBar.waitFor({ state: "attached", timeout: 10000 });
      assert.equal(await chartBar.getAttribute("aria-valuenow"), "0");

      const progressBar = this.page.getByTestId(`funnel-step-progress-${stepName}`);
      await progressBar.waitFor({ state: "attached", timeout: 10000 });
      assert.equal(await progressBar.getAttribute("aria-valuenow"), "0");
    }
  },
);

