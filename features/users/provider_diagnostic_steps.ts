import { providerDiagnosticFixture } from "./provider_diagnostic_fixture";
import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

const defaultProviderDiagnostic = providerDiagnosticFixture;

Given("que existe un prestador registrado en el marketplace", async function (this: CustomWorld) {
  await this.stubGet("/admin/providers/201/diagnostic", defaultProviderDiagnostic);
});

When("consulto la ficha de diagnóstico del prestador", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
});

Then(
  "visualizo sus datos de contacto, rubro asignado y el panel de condiciones operativas con los estados de identidad, cobros, zonas y calendario",
  async function (this: CustomWorld) {
    // Wait for the client component to finish loading and display the panel
    const conditionsPanel = this.page.getByTestId("operational-conditions-panel");
    await conditionsPanel.waitFor({ state: "visible" });

    // Contact and profile data
    const text = await this.page.locator("body").innerText();
    assert.ok(text.includes("Juan Gómez"), "Debe mostrar el nombre completo");
    assert.ok(text.includes("juan@example.com"), "Debe mostrar el correo electrónico");
    assert.ok(text.includes("No disponible"), "No debe inventar el teléfono ausente");
    assert.ok(text.includes("Plomería"), "Debe mostrar el rubro");

    // Operational conditions panel checks
    const conditionsText = await conditionsPanel.innerText();
    assert.ok(conditionsText.toLowerCase().includes("identidad"), "Debe incluir condición de identidad");
    assert.ok(conditionsText.toLowerCase().includes("cobros"), "Debe incluir condición de cobros");
    assert.ok(conditionsText.toLowerCase().includes("zonas"), "Debe incluir condición de zonas");
    assert.ok(conditionsText.toLowerCase().includes("calendario"), "Debe incluir condición de calendario");
  },
);

Given(
  "que el prestador no ha vinculado su cuenta de cobro en la pasarela de pagos",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/providers/201/diagnostic", {
      ...defaultProviderDiagnostic,
      payment: { state: "disconnected", token_expires_on: null },
    });
  },
);

When("consulto su ficha de diagnóstico operativo", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
});

Then(
  "la condición de cobros se visualiza desconectada sin inferir su capacidad de recibir pagos",
  async function (this: CustomWorld) {
    const conditionsPanel = this.page.getByTestId("operational-conditions-panel");
    await conditionsPanel.waitFor({ state: "visible" });

    const conditionsText = await conditionsPanel.innerText();
    assert.ok(
      conditionsText.toLowerCase().includes("desconectado"),
      "Debe mostrar la condición de cobros desconectada",
    );
    assert.ok(
      conditionsText.includes("Capacidad de cobro no informada"),
      "No debe inferir capacidad de cobro",
    );
  },
);
Given(
  "que el prestador tiene su verificación de identidad pendiente de revisión",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/providers/201/diagnostic", {
      ...defaultProviderDiagnostic,
      provider: { ...defaultProviderDiagnostic.provider, identity_verification_status: "in_review", identity_verified_on: null },
    });
  },
);

Then(
  "se visualiza el estado real de identidad sin atribuirle una suspensión operativa injustificada",
  async function (this: CustomWorld) {
    const conditionsPanel = this.page.getByTestId("operational-conditions-panel");
    await conditionsPanel.waitFor({ state: "visible" });

    const conditionsText = await conditionsPanel.innerText();
    assert.ok(
      conditionsText.includes("En revisión"),
      "Debe mostrar el estado real de identidad 'En revisión'",
    );

    const bodyText = await this.page.locator("body").innerText();
    const lowerBody = bodyText.toLowerCase();
    assert.ok(
      !lowerBody.includes("suspendido"),
      "No debe atribuir una suspensión operativa al prestador",
    );
    assert.ok(
      !lowerBody.includes("suspensión"),
      "No debe mencionar suspensión en el diagnóstico",
    );
    assert.ok(
      !lowerBody.includes("inhabilitado"),
      "No debe marcar al prestador como inhabilitado",
    );
  },
);

Given(
  "que el prestador posee zonas de cobertura configuradas en su cuenta",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/providers/201/diagnostic", {
      ...defaultProviderDiagnostic,
      provider: { ...defaultProviderDiagnostic.provider, coverage_zones: [
        { id: 6, name: "Comuna 6", enabled: true },
        { id: 14, name: "Comuna 14", enabled: false },
      ] },
    });
  },
);

When(
  "consulto la sección de cobertura en su ficha de diagnóstico",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
  },
);

Then(
  "visualizo el listado de zonas asignadas y cuáles se encuentran activas para recibir solicitudes",
  async function (this: CustomWorld) {
    const conditionsPanel = this.page.getByTestId("operational-conditions-panel");
    await conditionsPanel.waitFor({ state: "visible" });

    const zonesCard = conditionsPanel.getByTestId("zones-condition-card");
    await zonesCard.waitFor({ state: "visible" });

    const zonesText = await zonesCard.innerText();
    assert.ok(zonesText.includes("Comuna 6"), "Debe mostrar Comuna 6");
    assert.ok(zonesText.includes("Comuna 14"), "Debe mostrar Comuna 14");

    const activeBadge = zonesCard.locator('[data-zone-active="true"]');
    await activeBadge.waitFor({ state: "visible" });
    const activeText = await activeBadge.innerText();
    assert.ok(
      activeText.includes("Comuna 6"),
      "Comuna 6 debe estar marcada como activa",
    );
    assert.ok(
      activeText.toLowerCase().includes("activa") ||
        activeText.toLowerCase().includes("habilitada"),
      "Debe indicar que se encuentra activa o habilitada para recibir solicitudes",
    );

    const inactiveBadge = zonesCard.locator('[data-zone-active="false"]');
    await inactiveBadge.waitFor({ state: "visible" });
    const inactiveText = await inactiveBadge.innerText();
    assert.ok(
      inactiveText.includes("Comuna 14"),
      "Comuna 14 debe estar marcada como inactiva",
    );
  },
);
Given(
  "que el prestador registra actividad previa de solicitudes y órdenes",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/providers/201/diagnostic", {
      ...defaultProviderDiagnostic,

    });
  },
);

When(
  "consulto la sección de actividad en la ficha del prestador",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
  },
);

Then(
  "visualizo el resumen de trabajos con accesos directos hacia sus contrataciones en el Centro de Operaciones",
  async function (this: CustomWorld) {
    const activitySummary = this.page.getByTestId("provider-activity-summary");
    await activitySummary.waitFor({ state: "visible" });

    const summaryText = await activitySummary.innerText();
    assert.ok(summaryText.includes("Orden #105"), "Debe mostrar la actividad real por recurso");
    assert.ok(summaryText.includes("No informado"), "No debe inventar totales históricos");

    const operationLink = activitySummary.locator(
      `a[href="/operaciones?provider_id=201"]`,
    );
    await operationLink.waitFor({ state: "visible" });
    assert.ok(
      await operationLink.isVisible(),
      "Debe tener un enlace directo a la operación en el Centro de Operaciones",
    );
  },
);

Given(
  "que la consulta del diagnóstico del prestador toma unos momentos",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/providers/201/diagnostic",
      status: 200,
      body: defaultProviderDiagnostic,
      delayMs: 3000,
    });
  },
);

When(
  "accedo a la ficha de diagnóstico del prestador",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
  },
);

Given(
  "que intento consultar un prestador que no se encuentra registrado",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/providers/999/diagnostic", { error: "Not Found" }, 404);
  },
);

When(
  "accedo al enlace de diagnóstico del prestador",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.providerDetail(999), this.appUrl).href);
  },
);

Then(
  "se presenta un mensaje claro indicando que el prestador no fue encontrado",
  async function (this: CustomWorld) {
    const alert = this.page.getByRole("alert").filter({
      hasText: /no fue encontrado|no encontrado/i,
    });
    await alert.waitFor({ state: "visible", timeout: 5000 });
    assert.ok(await alert.isVisible(), "Debe mostrar un mensaje claro indicando que el prestador no fue encontrado");

    const backLink = alert.locator(`a[href="${ROUTES.users}"]`);
    await backLink.waitFor({ state: "visible", timeout: 5000 });
    assert.ok(await backLink.isVisible(), "Debe mostrar el enlace de retorno al directorio");
  },
);

Given(
  "que mi cuenta de usuario no posee permisos para consultar el detalle de prestadores",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/providers/201/diagnostic", { error: "Forbidden" }, 403);
  },
);

When(
  "intento ingresar a la ficha de diagnóstico del prestador",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
  },
);

When(
  "intento consultar la ficha de diagnóstico del prestador",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
  },
);

