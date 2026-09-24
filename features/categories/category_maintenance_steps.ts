import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

Given(
  "que existe el rubro {string} en el catálogo",
  async function (this: CustomWorld, categoryName: string) {
    await this.stubGet("/categories", [{ id: 1, name: categoryName }]);
    await this.page.goto(new URL(ROUTES.categories, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

Given(
  /^(?:que )?abro la edición del rubro "([^"]+)"$/,
  async function (this: CustomWorld, categoryName: string) {
    if (!this.page.url().includes(ROUTES.categories)) {
      await this.stubGet("/categories", [{ id: 1, name: categoryName }]);
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
    await this.stubPatch("/categories/1", 200, { id: 1, name: newName });
    await this.stubGet("/categories", [{ id: 1, name: newName }]);

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

