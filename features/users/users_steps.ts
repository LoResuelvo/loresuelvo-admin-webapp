import assert from "node:assert/strict";
import { DataTable, Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

Given(
  "que existen los siguientes consumidores registrados:",
  async function (this: CustomWorld, dataTable: DataTable) {
    const consumers = dataTable.hashes().map((row, index) => ({
      id: index + 1,
      role: "consumer",
      name: row.nombre,
      surname: row.apellido,
      email: row.correo,
      profile_photo_url: `https://example.com/photos/${row.nombre.toLowerCase()}.jpg`,
      created_on: row.fecha_registro ?? "2026-09-10",
    }));
    await this.stubGet("/admin/consumers", consumers);
  },
);

When("ingreso al directorio de consumidores", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.users, this.appUrl).href);
});

Then(
  "veo el listado de consumidores con su foto, nombre, apellido, correo y fecha de registro",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    const row0 = rows.nth(0);
    await row0.locator("img").waitFor();
    const text0 = await row0.innerText();
    assert.ok(text0.includes("Ana"));
    assert.ok(text0.includes("Pérez"));
    assert.ok(text0.includes("ana@example.com"));

    const row1 = rows.nth(1);
    await row1.locator("img").waitFor();
    const text1 = await row1.innerText();
    assert.ok(text1.includes("Beatriz"));
    assert.ok(text1.includes("Suárez"));
    assert.ok(text1.includes("beatriz@example.com"));
  },
);

Then("la vista no incluye a prestadores ni administradores", async function (this: CustomWorld) {
  const table = this.page.getByRole("table");
  const text = await table.innerText();
  assert.ok(!text.toLowerCase().includes("prestador"));
  assert.ok(!text.toLowerCase().includes("administrador"));
});

Given(
  "que la consulta del directorio de consumidores tarda en responder",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/consumers",
      status: 200,
      body: [],
      delayMs: 3000,
    });
  },
);

