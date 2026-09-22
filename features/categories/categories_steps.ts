import assert from "node:assert/strict";
import { DataTable, Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

Given("que existen los siguientes rubros:", async function (this: CustomWorld, dataTable: DataTable) {
  const categories = dataTable.hashes().map((row) => ({
    id: Number(row.id),
    name: row.nombre,
  }));
  await this.stubGet("/categories", categories);
});

When("ingreso a la sección de rubros", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
});

Then(
  "veo los rubros ordenados alfabéticamente con su identificador y nombre",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 3);

    const cells0 = rows.nth(0).locator("td");
    assert.equal((await cells0.nth(0).innerText()).trim(), "1");
    assert.equal((await cells0.nth(1).innerText()).trim(), "Albañilería");

    const cells1 = rows.nth(1).locator("td");
    assert.equal((await cells1.nth(0).innerText()).trim(), "2");
    assert.equal((await cells1.nth(1).innerText()).trim(), "Electricidad");

    const cells2 = rows.nth(2).locator("td");
    assert.equal((await cells2.nth(0).innerText()).trim(), "3");
    assert.equal((await cells2.nth(1).innerText()).trim(), "Plomería");
  },
);

Given("que la consulta de rubros tarda en responder", async function (this: CustomWorld) {
  await this.addApiStub({
    method: "GET",
    endpoint: "/categories",
    status: 200,
    body: [],
    delayMs: 3000,
  });
});

Then(
  "veo un indicador de carga mientras se obtienen los datos",
  async function (this: CustomWorld) {
    const loadingIndicator = this.page.getByRole("status").filter({
      hasText: /cargando/i,
    });
    await loadingIndicator.waitFor({ state: "visible" });
  },
);

Given("que no existen rubros registrados", async function (this: CustomWorld) {
  await this.stubGet("/categories", []);
});

Then(
  "veo un mensaje indicando que no hay rubros registrados",
  async function (this: CustomWorld) {
    const emptyMessage = this.page.getByRole("status").filter({
      hasText: "No hay rubros registrados",
    });
    await emptyMessage.waitFor({ state: "visible" });
  },
);

Given("que el servicio de consulta de rubros no está disponible", async function (this: CustomWorld) {
  await this.addApiStub({
    method: "GET",
    endpoint: "/categories",
    status: 503,
    body: { error: "Service unavailable" },
  });
});

Then(
  "veo un mensaje de error indicando que no se pudieron obtener los rubros",
  async function (this: CustomWorld) {
    const errorAlert = this.page.getByRole("alert").filter({
      hasText: "No se pudieron obtener los rubros",
    });
    await errorAlert.waitFor({ state: "visible" });
  },
);

Given(
  /^(?:que )?abro el formulario de creación de rubro$/,
  async function (this: CustomWorld) {
    if (!this.page.url().includes(ROUTES.categories)) {
      await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    }
    const openButton = this.page.getByRole("button", { name: "Nuevo rubro" });
    await openButton.click();
    const modal = this.page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });
  },
);

When(
  "creo el rubro {string}",
  async function (this: CustomWorld, categoryName: string) {
    await this.stubPost("/categories", 201, {
      id: 99,
      name: categoryName,
      normalized_name: categoryName.toLowerCase(),
    });
    await this.stubGet("/categories", [
      { id: 99, name: categoryName },
    ]);

    const nameInput = this.page.getByLabel("Nombre del rubro");
    await nameInput.fill(categoryName);

    const submitButton = this.page.getByRole("button", { name: "Crear rubro" });
    await submitButton.click();
  },
);

Then("el modal se cierra", async function (this: CustomWorld) {
  const modal = this.page.getByRole("dialog");
  await modal.waitFor({ state: "hidden" });
});

Then("veo un mensaje de confirmación", async function (this: CustomWorld) {
  const confirmation = this.page.getByRole("status").filter({
    hasText: "Rubro creado exitosamente",
  });
  await confirmation.waitFor({ state: "visible" });
});

Then(
  "el rubro {string} aparece en el catálogo",
  async function (this: CustomWorld, categoryName: string) {
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
    const row = this.page.locator("tbody tr").filter({ hasText: categoryName });
    await row.waitFor({ state: "visible" });
  },
);
