import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

const defaultProviderDiagnostic = {
  id: 201,
  name: "Juan",
  surname: "Gómez",
  email: "juan@example.com",
  phone: "+54 11 5555-0101",
  profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
  category: { id: 2, name: "Plomería" },
  coverage_zones: [
    { id: 6, name: "Comuna 6", is_active: true },
    { id: 14, name: "Comuna 14", is_active: false },
  ],
  identity_verification: {
    status: "approved",
    verified_at: "2026-09-15T12:00:00-03:00",
  },
  payment_connection: {
    is_connected: true,
    account_id: "mp-acc-8812",
    can_receive_payments: true,
  },
  calendar_connection: {
    status: "connected",
  },
  activity_summary: {
    total_requests: 14,
    active_orders: 2,
    completed_orders: 10,
    average_rating: 4.8,
    reviews_count: 9,
    recent_operations: [
      {
        id: 105,
        category_name: "Plomería",
        consumer_name: "Carlos López",
        status: "in_progress",
        created_at: "2026-09-21T09:30:00-03:00",
      },
    ],
  },
};

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
    assert.ok(text.includes("+54 11 5555-0101"), "Debe mostrar el teléfono");
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
      payment_connection: {
        is_connected: false,
        account_id: null,
        can_receive_payments: false,
      },
    });
  },
);

When("consulto su ficha de diagnóstico operativo", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.providerDetail(201), this.appUrl).href);
});

Then(
  "la condición de cobros se visualiza desconectada indicando que no puede recibir señas ni pagos",
  async function (this: CustomWorld) {
    const conditionsPanel = this.page.getByTestId("operational-conditions-panel");
    await conditionsPanel.waitFor({ state: "visible" });

    const conditionsText = await conditionsPanel.innerText();
    assert.ok(
      conditionsText.toLowerCase().includes("desconectado"),
      "Debe mostrar la condición de cobros desconectada",
    );
    assert.ok(
      conditionsText.includes("No puede recibir señas ni pagos"),
      "Debe advertir que no puede recibir señas ni pagos",
    );
  },
);

