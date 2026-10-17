import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

function categoryDto(id: number, name: string, enabled = true, version = 1) {
  return { id, name, enabled, version };
}

function categoryImpactDto(
  id: number,
  name: string,
  providers: number,
  scheduledOrders = 0,
  awaitingPaymentOrders = 0,
) {
  const hasOngoingOrders = scheduledOrders + awaitingPaymentOrders > 0;
  return {
    category: categoryDto(id, name),
    observed_at: "2026-10-15T12:00:00Z",
    counts: {
      assigned_providers: providers,
      pending_requests: 0,
      accepted_requests_without_proposal: 0,
      pending_proposals: 0,
      scheduled_orders: scheduledOrders,
      awaiting_payment_orders: awaitingPaymentOrders,
    },
    has_ongoing_orders: hasOngoingOrders,
    requires_confirmation: hasOngoingOrders,
    existing_operations_can_continue: true,
  };
}

Given(
  "que existe el rubro {string} en el catálogo",
  async function (this: CustomWorld, categoryName: string) {
    await this.stubGet("/categories", [categoryDto(1, categoryName)]);
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

Given(
  /^(?:que )?abro la edición del rubro "([^"]+)"$/,
  async function (this: CustomWorld, categoryName: string) {
    if (!this.page.url().includes(ROUTES.categories)) {
      await this.stubGet("/categories", [categoryDto(1, categoryName)]);
      await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    }
    const editButton = this.page.getByRole("button", { name: `Editar rubro ${categoryName}` });
    await editButton.waitFor({ state: "visible" });
    await editButton.click();
    const modal = this.page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });
  },
);

When(
  "modifico el nombre por {string} y guardo los cambios",
  async function (this: CustomWorld, newName: string) {
    await this.stubPatch("/categories/1", 200, categoryDto(1, newName, true, 2));
    await this.stubGet("/categories", [categoryDto(1, newName, true, 2)]);

    const nameInput = this.page.getByLabel("Nombre del rubro");
    await nameInput.fill(newName);

    const submitButton = this.page.getByRole("button", { name: "Guardar cambios" });
    await submitButton.click();
  },
);

Then("el modal de edición se cierra", async function (this: CustomWorld) {
  const modal = this.page.getByRole("dialog");
  await modal.waitFor({ state: "hidden" });
});

Then("veo un mensaje de confirmación de actualización", async function (this: CustomWorld) {
  const confirmation = this.page.getByRole("status").filter({
    hasText: "Rubro actualizado exitosamente",
  });
  await confirmation.waitFor({ state: "visible" });
});

Then(
  "el catálogo muestra el rubro actualizado con el nombre {string}",
  async function (this: CustomWorld, categoryName: string) {
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
    const row = this.page.locator("tbody tr").filter({ hasText: categoryName });
    await row.waitFor({ state: "visible" });
  },
);

When("intento guardar el rubro con el nombre vacío", async function (this: CustomWorld) {
  const nameInput = this.page.getByLabel("Nombre del rubro");
  await nameInput.fill("");

  const submitButton = this.page.getByRole("button", { name: "Guardar cambios" });
  await submitButton.click();
});

Then(
  "el formulario de edición conserva el foco sin cerrarse",
  async function (this: CustomWorld) {
    const modal = this.page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });
    assert.equal(await modal.isVisible(), true);

    const nameInput = this.page.getByLabel("Nombre del rubro");
    await nameInput.waitFor({ state: "visible" });
    const isFocused = await nameInput.evaluate((el) => document.activeElement === el);
    assert.equal(isFocused, true);
  },
);

Given(
  "que existen los rubros {string} y {string}",
  async function (this: CustomWorld, cat1: string, cat2: string) {
    await this.stubGet("/categories", [
      categoryDto(1, cat1),
      categoryDto(2, cat2),
    ]);
    await this.stubPatch("/categories/1", 409, { error: "category already exists" });
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

When(
  "intento cambiar el nombre por {string}",
  async function (this: CustomWorld, newName: string) {
    this.lastAttemptedCategoryName = newName;
    const nameInput = this.page.getByLabel("Nombre del rubro");
    await nameInput.fill(newName);

    const submitButton = this.page.getByRole("button", { name: "Guardar cambios" });
    await submitButton.click();
  },
);

Then("el formulario de edición permanece abierto", async function (this: CustomWorld) {
  const modal = this.page.getByRole("dialog");
  await modal.waitFor({ state: "visible" });
  assert.equal(await modal.isVisible(), true);
});

Given(
  "que el rubro {string} no registra órdenes de trabajo activas en curso",
  async function (this: CustomWorld, categoryName: string) {
    await this.stubGet("/categories", [categoryDto(1, categoryName)]);
    await this.stubGet("/admin/categories/1/impact", categoryImpactDto(1, categoryName, 3));
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

When(
  "solicito desactivar el rubro {string}",
  async function (this: CustomWorld, categoryName: string) {
    const deactivateButton = this.page.getByRole("button", {
      name: `Desactivar rubro ${categoryName}`,
    });
    await deactivateButton.waitFor({ state: "visible" });
    await deactivateButton.click();
    const modal = this.page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });
  },
);

When(
  "confirmo la desactivación tras revisar el impacto de prestadores asociados",
  async function (this: CustomWorld) {
    await this.stubPatch("/categories/1", 200, categoryDto(1, "Cerrajería", false, 2));
    await this.page.getByLabel("Motivo de desactivación").fill("Cierre del rubro");
    const confirmButton = this.page.getByRole("button", { name: "Confirmar desactivación" });
    await confirmButton.waitFor({ state: "visible" });
    await confirmButton.click();
  },
);

Then("el diálogo de impacto se cierra", async function (this: CustomWorld) {
  const modal = this.page.getByRole("dialog");
  await modal.waitFor({ state: "hidden" });
});

Then("veo un mensaje de confirmación de desactivación", async function (this: CustomWorld) {
  const confirmation = this.page.getByRole("status").filter({
    hasText: "Rubro desactivado exitosamente",
  });
  await confirmation.waitFor({ state: "visible" });
});

Then(
  "el rubro {string} se visualiza como inactivo en el catálogo",
  async function (this: CustomWorld, categoryName: string) {
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
    const row = this.page.locator("tbody tr").filter({ hasText: categoryName });
    await row.waitFor({ state: "visible" });
    const statusCell = row.getByText("Inactivo");
    await statusCell.waitFor({ state: "visible" });
  },
);

Given(
  "que el rubro {string} registra {int} órdenes en curso que requieren confirmación",
  async function (this: CustomWorld, categoryName: string, ordersCount: number) {
    await this.stubGet("/categories", [categoryDto(2, categoryName)]);
    await this.stubGet("/admin/categories/2/impact", categoryImpactDto(2, categoryName, 5, ordersCount, 0));
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

Then(
  "se presenta una advertencia con la cantidad de órdenes en curso y se solicita confirmación explícita",
  async function (this: CustomWorld) {
    const alert = this.page.getByRole("alert").filter({
      hasText: "3 órdenes programadas o pendientes de pago",
    });
    await alert.waitFor({ state: "visible" });
    const confirmation = this.page.getByLabel("Confirmo la desactivación aunque existan órdenes en curso");
    await confirmation.waitFor({ state: "visible" });
    assert.equal(await this.page.getByRole("button", { name: "Confirmar desactivación" }).isDisabled(), true);
  },
);

Given(
  "que el cálculo de impacto de un rubro toma unos momentos",
  async function (this: CustomWorld) {
    await this.stubGet("/categories", [categoryDto(3, "Pintura")]);
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/categories/3/impact",
      status: 200,
      body: categoryImpactDto(3, "Pintura", 2),
      delayMs: 1500,
    });
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

Then(
  "se presenta un indicador de carga mientras se evalúa el impacto en prestadores y órdenes",
  async function (this: CustomWorld) {
    const loading = this.page.getByRole("status").filter({
      hasText: "Evaluando impacto en prestadores y órdenes...",
    });
    await loading.waitFor({ state: "visible" });
  },
);
Given(
  "que mi cuenta de usuario no posee permisos de modificación de rubros",
  async function (this: CustomWorld) {
    await this.stubGet("/categories", [categoryDto(1, "Plomería")]);
    await this.stubPatch("/categories/1", 403, { error: "Forbidden" });
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

When(
  "intento guardar la edición de un rubro",
  async function (this: CustomWorld) {
    const editButton = this.page.getByRole("button", { name: "Editar rubro Plomería" });
    await editButton.waitFor({ state: "visible" });
    await editButton.click();
    const modal = this.page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });
    const submitButton = this.page.getByRole("button", { name: "Guardar cambios" });
    await submitButton.click();
  },
);

Given(
  "que el servidor experimenta dificultades de comunicación al modificar un rubro",
  async function (this: CustomWorld) {
    await this.stubGet("/categories", [categoryDto(1, "Plomería")]);
    await this.stubPatch("/categories/1", 500, { error: "Internal Server Error" });
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

When(
  "intento confirmar la modificación de un rubro",
  async function (this: CustomWorld) {
    const editButton = this.page.getByRole("button", { name: "Editar rubro Plomería" });
    await editButton.waitFor({ state: "visible" });
    await editButton.click();
    const modal = this.page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });
    const submitButton = this.page.getByRole("button", { name: "Guardar cambios" });
    await submitButton.click();
  },
);

Then(
  "se presenta un aviso informando el inconveniente con la posibilidad de reintentar",
  async function (this: CustomWorld) {
    const errorAlert = this.page.getByRole("alert").filter({
      hasText: /error|inconveniente|problema|falló|no se pudo/i,
    });
    await errorAlert.waitFor({ state: "visible" });
    assert.ok(await errorAlert.isVisible());
    const retryButton = this.page.getByRole("button", { name: /reintentar/i });
    await retryButton.waitFor({ state: "visible" });
    assert.ok(await retryButton.isVisible());
  },
);
