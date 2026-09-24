import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

export const defaultConsumerHistory = {
  id: 301,
  name: "Carlos",
  surname: "López",
  email: "carlos@example.com",
  phone: "+54 11 4444-2222",
  profile_photo_url: "https://storage.loresuelvo.internal/profiles/301.jpg",
  registered_at: "2026-09-01T10:00:00-03:00",
  current_address: "Av. Rivadavia 4500",
  coverage_zone: {
    id: 6,
    name: "Comuna 6",
  },
  history: [
    {
      resource_id: 105,
      operation_id: 105,
      resource_type: "work_order",
      category_name: "Plomería",
      provider: {
        id: 201,
        name: "Juan Gómez",
        profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
      },
      status: "completed",
      total_amount_cents: 2000000,
      created_at: "2026-09-20T10:00:00-03:00",
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    total_pages: 1,
  },
};

Given("que existe un consumidor registrado en el marketplace", async function (this: CustomWorld) {
  await this.stubGet("/admin/consumers/301/history", defaultConsumerHistory);
});

When("consulto la ficha del consumidor", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
});

Then(
  "visualizo sus datos de contacto, fecha de registro y la dirección habitual registrada",
  async function (this: CustomWorld) {
    const header = this.page.getByTestId("consumer-profile-header");
    await header.waitFor({ state: "visible" });

    const text = await this.page.locator("body").innerText();
    assert.ok(text.includes("Carlos López"), "Debe mostrar el nombre completo");
    assert.ok(text.includes("carlos@example.com"), "Debe mostrar el correo electrónico");
    assert.ok(text.includes("+54 11 4444-2222"), "Debe mostrar el teléfono");
    assert.ok(text.includes("Av. Rivadavia 4500"), "Debe mostrar la dirección habitual");
    assert.ok(text.includes("Comuna 6"), "Debe mostrar la zona de cobertura");
    assert.ok(text.includes("01/09/2026"), "Debe mostrar la fecha de registro formateada");
  },
);
