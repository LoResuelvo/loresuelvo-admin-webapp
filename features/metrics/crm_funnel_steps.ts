import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { computeDateRange, type PeriodOption } from "../../domain/metrics/funnel-date-range";
import { CustomWorld } from "../support/world";
import {
  crmAiAndManualFunnelFixture,
  crmAiFunnelFixture,
  crmComparisonFiltersFixture,
  crmComparisonFunnelFixture,
  crmComparisonPeriodFiltersFixture,
  crmDelaysAndObservationFixture,
  crmZeroBaseAndZeroProgressFixture,
} from "./crm_funnel_fixtures";
import { mockCategories } from "./operational_funnel_fixtures";

async function openDisclosure(page: CustomWorld["page"], label: string): Promise<void> {
  const summary = page.getByText(label, { exact: true });
  await summary.waitFor({ state: "visible", timeout: 10000 });
  const disclosure = summary.locator("xpath=..");
  if ((await disclosure.getAttribute("open")) === null) await summary.click();
}

async function openStageDetails(page: CustomWorld["page"]): Promise<void> {
  const summary = page.getByText("Ver detalle por etapa", { exact: true });
  if ((await summary.count()) === 0) return;
  await openDisclosure(page, "Ver detalle por etapa");
}

function funnelEndpoint(from: string, to: string, categoryId?: number): string {
  const params = new URLSearchParams({ from, to });
  if (categoryId) params.set("category_id", String(categoryId));
  return `/admin/metrics/funnel?${params.toString()}`;
}

function defaultFunnelEndpoint(preset: PeriodOption = "7d", categoryId?: number): string {
  const { from, to } = computeDateRange(preset);
  return funnelEndpoint(from, to, categoryId);
}

function periodResponseForFilters(
  from: string,
  to: string,
  asOf: Date,
): { from: string; to: string } {
  const nextDay = new Date(`${to}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const exclusiveEnd = `${nextDay.toISOString().slice(0, 10)}T00:00:00-03:00`;

  return {
    from: `${from}T00:00:00-03:00`,
    to: new Date(exclusiveEnd) > asOf ? asOf.toISOString() : exclusiveEnd,
  };
}

function formatFilterDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatBuenosAiresTimestampForAssertion(value: string): string {
  const localDate = new Date(Date.parse(value) - 3 * 60 * 60 * 1000);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localDate.getUTCDate()).padStart(2, "0");
  const hour = String(localDate.getUTCHours()).padStart(2, "0");
  const minute = String(localDate.getUTCMinutes()).padStart(2, "0");
  const second = String(localDate.getUTCSeconds()).padStart(2, "0");

  return `${formatFilterDate(`${year}-${month}-${day}`)}, ${hour}:${minute}:${second}`;
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
    await openStageDetails(this.page);
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
    await openStageDetails(this.page);
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
    await openStageDetails(this.page);
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

Then(
  "la metodología permanece plegada y la base inicial destaca en el resumen global",
  async function (this: CustomWorld) {
    const methodology = this.page.getByText("Cómo se calcula", { exact: true });
    await methodology.waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await methodology.locator("xpath=..").getAttribute("open"), null);

    const overview = this.page.getByRole("region", {
      name: "Resumen de conversión global",
    });
    const initialCount = overview.getByTestId("global-conversion-count");
    await initialCount.waitFor({ state: "visible", timeout: 10000 });
    assert.match(
      (await initialCount.getAttribute("aria-label")) ?? "",
      /de 100 evaluaciones profesionales/i,
    );
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
    await openStageDetails(this.page);
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
    await openStageDetails(this.page);
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
    const count = overview.getByTestId("global-conversion-count");
    await count.waitFor({ state: "visible", timeout: 10000 });
    assert.equal((await count.textContent())?.trim(), "1 de 3");
    assert.match(
      (await count.getAttribute("aria-label")) ?? "",
      /1 finalización reportada de 3 solicitudes manuales/i,
    );
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
    const aiBase = aiOverview.getByTestId("global-conversion-count");
    const manualBase = manualOverview.getByTestId("global-conversion-count");
    await aiBase.waitFor({ state: "visible", timeout: 10000 });
    await manualBase.waitFor({ state: "visible", timeout: 10000 });
    assert.match((await aiBase.getAttribute("aria-label")) ?? "", /de 2 solicitudes IA/i);
    assert.match((await manualBase.getAttribute("aria-label")) ?? "", /de 3 solicitudes manuales/i);

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
    await openDisclosure(this.page, "Cómo se interpreta el período");
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
    await openStageDetails(this.page);

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
    await openStageDetails(this.page);

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

Given(
  "que la respuesta incluye el período efectivo, la fecha de observación y demoras con su cantidad de observaciones",
  async function (this: CustomWorld) {
    await this.stubGet(defaultFunnelEndpoint(), crmDelaysAndObservationFixture);
  },
);

When("consulto el detalle del embudo", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.metrics, this.appUrl).href);
});

Then(
  "veo el período y la fecha de observación",
  async function (this: CustomWorld) {
    await openDisclosure(this.page, "Período y actualización");
    const period = this.page.getByTestId("funnel-effective-period");
    await period.waitFor({ state: "visible", timeout: 10000 });
    const periodText = await period.textContent();
    assert.match(
      periodText ?? "",
      /15\/10\/2026,?\s00:00:00.*23\/10\/2026,?\s00:00:00 \(hasta exclusivo\)/,
    );

    const observed = this.page.getByTestId("funnel-observation-date");
    await observed.waitFor({ state: "visible", timeout: 10000 });
    const observedText = await observed.textContent();
    assert.ok(observedText?.includes("23/10/2026"));
    assert.ok(observedText?.includes("America/Argentina/Buenos_Aires"));
  },
);

Then(
  "las demoras disponibles indican su cantidad de observaciones",
  async function (this: CustomWorld) {
    await openStageDetails(this.page);
    const proposalDuration = this.page.getByTestId("duration-proposals_sent");
    await proposalDuration.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await proposalDuration.textContent())?.includes("15 min"));
    const proposalObs = this.page.getByTestId("delay-observations-proposals_sent");
    await proposalObs.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await proposalObs.textContent())?.includes("25 observaciones"));

    const depositDuration = this.page.getByTestId("duration-deposits_paid");
    await depositDuration.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await depositDuration.textContent())?.includes("1 h"));
    const depositObs = this.page.getByTestId("delay-observations-deposits_paid");
    await depositObs.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await depositObs.textContent())?.includes("12 observaciones"));

    const orderDuration = this.page.getByTestId("duration-orders_completed");
    await orderDuration.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await orderDuration.textContent())?.includes("1 d"));
    const orderObs = this.page.getByTestId("delay-observations-orders_completed");
    await orderObs.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await orderObs.textContent())?.includes("8 observaciones"));

    const paymentDuration = this.page.getByTestId("duration-full_payments");
    await paymentDuration.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await paymentDuration.textContent())?.includes("0 min"));
    const paymentObs = this.page.getByTestId("delay-observations-full_payments");
    await paymentObs.waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await paymentObs.textContent())?.includes("4 observaciones"));
  },
);

Then(
  "se aclara que son tiempos de transiciones realizadas y no espera de casos pendientes",
  async function (this: CustomWorld) {
    await openStageDetails(this.page);
    const notice = this.page.getByTestId("funnel-delays-notice");
    await notice.waitFor({ state: "visible", timeout: 10000 });
    assert.match(
      (await notice.textContent()) ?? "",
      /transiciones realizadas.*no.*espera de casos pendientes/i,
    );
  },
);

Given(
  "que estoy comparando solicitudes IA y manuales",
  async function (this: CustomWorld) {
    await this.stubGet("/categories", mockCategories);
    await this.stubGet("/admin/categories", mockCategories);
    await this.stubGet(defaultFunnelEndpoint(), crmComparisonFunnelFixture);
    await this.page.goto(new URL(ROUTES.metrics, this.appUrl).href);
    const source = this.page.getByRole("combobox", { name: "Origen" });
    await source.waitFor({ state: "visible", timeout: 10000 });
    await source.selectOption("comparison");
    const aiPanel = this.page.getByTestId("funnel-comparison-panel-ai");
    await aiPanel.waitFor({ state: "visible", timeout: 10000 });
    await aiPanel
      .getByTestId("funnel-step-requests_created")
      .getByText("2", { exact: true })
      .waitFor({ state: "visible", timeout: 10000 });
    await this.page
      .getByTestId("funnel-comparison-panel-manual")
      .getByTestId("funnel-step-requests_created")
      .getByText("3", { exact: true })
      .waitFor({ state: "visible", timeout: 10000 });
  },
);

When(
  "aplico un período y un rubro",
  async function (this: CustomWorld) {
    const asOf = new Date();
    const { from, to } = computeDateRange("30d", asOf);
    const period = periodResponseForFilters(from, to, asOf);
    await this.stubGet(funnelEndpoint(from, to), {
      ...crmComparisonPeriodFiltersFixture,
      period,
      observed_at: asOf.toISOString(),
    });
    await this.stubGet(funnelEndpoint(from, to, 47), {
      ...crmComparisonFiltersFixture,
      period,
      observed_at: asOf.toISOString(),
    });

    const aiPanel = this.page.getByTestId("funnel-comparison-panel-ai");
    const manualPanel = this.page.getByTestId("funnel-comparison-panel-manual");

    const periodSelect = this.page
      .getByRole("combobox", { name: /rango temporal|período/i })
      .or(this.page.getByTestId("metrics-period-select"));
    await periodSelect.waitFor({ state: "visible", timeout: 10000 });
    await periodSelect.selectOption("30d");
    await aiPanel
      .getByTestId("funnel-step-requests_created")
      .getByText("10", { exact: true })
      .waitFor({ state: "visible", timeout: 10000 });
    await manualPanel
      .getByTestId("funnel-step-requests_created")
      .getByText("15", { exact: true })
      .waitFor({ state: "visible", timeout: 10000 });

    const categorySelect = this.page
      .getByRole("combobox", { name: /rubro|oficio/i })
      .or(this.page.getByTestId("metrics-category-select"));
    await categorySelect.waitFor({ state: "visible", timeout: 10000 });
    await categorySelect.selectOption("47");
    await aiPanel
      .getByTestId("funnel-step-requests_created")
      .getByText("8", { exact: true })
      .waitFor({ state: "visible", timeout: 10000 });
    await manualPanel
      .getByTestId("funnel-step-requests_created")
      .getByText("12", { exact: true })
      .waitFor({ state: "visible", timeout: 10000 });
  },
);

Then(
  "ambos orígenes usan exactamente esos filtros y muestran su período efectivo",
  async function (this: CustomWorld) {
    await openDisclosure(this.page, "Período y actualización");
    const periodSelect = this.page.getByRole("combobox", { name: "Rango temporal" });
    assert.equal(await periodSelect.inputValue(), "30d");

    const categorySelect = this.page.getByRole("combobox", { name: "Rubro" });
    assert.equal(await categorySelect.inputValue(), "47");

    const effectivePeriod = this.page.getByTestId("funnel-effective-period");
    const aiPanel = this.page.getByTestId("funnel-comparison-panel-ai");
    const manualPanel = this.page.getByTestId("funnel-comparison-panel-manual");
    await effectivePeriod.waitFor({ state: "visible", timeout: 10000 });

    const categoryStub = (await this.getStubs()).find((stub) => {
      if (
        stub.method !== "GET" ||
        !stub.endpoint.includes("category_id=47")
      ) return false;
      const response = stub.body as { category_id?: number };
      return response.category_id === 47;
    });
    assert.ok(categoryStub, "Expected the filtered funnel response fixture");
    const response = categoryStub.body as {
      period: { from: string; to: string };
      observed_at: string;
    };
    assert.equal(response.period.to, response.observed_at);
    assert.equal(
      response.period.from.slice(0, 10),
      new URLSearchParams(categoryStub.endpoint.split("?")[1]).get("from"),
    );

    const expectedFrom = formatBuenosAiresTimestampForAssertion(response.period.from);
    const expectedTo = formatBuenosAiresTimestampForAssertion(response.period.to);
    const [expectedFromDate, expectedFromTime] = expectedFrom.split(", ");
    const [expectedToDate, expectedToTime] = expectedTo.split(", ");
    const periodText = await effectivePeriod.textContent();
    assert.match(
      periodText ?? "",
      new RegExp(`${expectedFromDate},?\\s+${expectedFromTime}`),
    );
    assert.match(
      periodText ?? "",
      new RegExp(`${expectedToDate},?\\s+${expectedToTime}`),
    );
    assert.ok(periodText?.endsWith("(hasta exclusivo)"));

    const observed = this.page.getByTestId("funnel-observation-date");
    await observed.waitFor({ state: "visible", timeout: 10000 });
    const observedText = await observed.textContent();
    const expectedObservedAt = formatBuenosAiresTimestampForAssertion(response.observed_at);
    const [expectedObservedDate, expectedObservedTime] = expectedObservedAt.split(", ");
    assert.match(
      observedText ?? "",
      new RegExp(`${expectedObservedDate},?\\s+${expectedObservedTime.slice(0, 5)}`),
    );
    assert.ok(observedText?.includes("America/Argentina/Buenos_Aires"));

    for (const [panel, expectedCount] of [[aiPanel, "8"], [manualPanel, "12"]] as const) {
      const requestCount = panel
        .getByTestId("funnel-step-requests_created")
        .getByText(expectedCount, { exact: true });
      assert.equal(await requestCount.count(), 1);
    }
  },
);

Then(
  "la comparación mantiene solicitudes como unidad inicial en ambos orígenes",
  async function (this: CustomWorld) {
    const aiUnit = this.page.getByTestId("funnel-initial-unit-ai");
    const manualUnit = this.page.getByTestId("funnel-initial-unit-manual");
    await aiUnit.waitFor({ state: "visible", timeout: 10000 });
    await manualUnit.waitFor({ state: "visible", timeout: 10000 });

    assert.match((await aiUnit.textContent()) ?? "", /solicitud/i);
    assert.match((await manualUnit.textContent()) ?? "", /solicitud/i);
  },
);

