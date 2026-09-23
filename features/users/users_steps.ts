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

When(
  "busco en el directorio de consumidores con el texto {string}",
  async function (this: CustomWorld, query: string) {
    if (!this.page.url().includes(ROUTES.users)) {
      await this.page.goto(new URL(ROUTES.users, this.appUrl).href);
    }
    const searchInput = this.page.getByRole("searchbox").or(this.page.getByLabel(/buscar/i));
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(query);
  },
);

Then(
  "el listado contiene únicamente a {string}",
  async function (this: CustomWorld, expectedEmail: string) {
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor({ state: "visible" });
    assert.equal(await rows.count(), 1);
    const text = await rows.first().innerText();
    assert.ok(text.includes(expectedEmail));
  },
);

Given("que no existen consumidores registrados", async function (this: CustomWorld) {
  await this.stubGet("/admin/consumers", []);
});

Then(
  "veo un mensaje indicando que no hay consumidores disponibles",
  async function (this: CustomWorld) {
    const emptyMessage = this.page.getByRole("status").filter({
      hasText: "No hay consumidores disponibles",
    });
    await emptyMessage.waitFor({ state: "visible" });
  },
);

Given(
  'que mi cuenta no tiene el permiso "read:consumers"',
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/consumers",
      status: 403,
      body: { error: "Forbidden" },
    });
  },
);

When("intento ingresar al directorio de consumidores", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.users, this.appUrl).href);
});

Then(
  "veo un mensaje informativo de acceso restringido",
  async function (this: CustomWorld) {
    const alert = this.page.getByRole("alert").filter({
      hasText: /restringido|permisos/i,
    });
    await alert.waitFor({ state: "visible" });
  },
);

Given(
  "que el servicio de consulta de consumidores no está disponible",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/consumers",
      status: 503,
      body: { error: "Service unavailable" },
    });
  },
);

Then(
  "veo un mensaje de error recuperable con opción de reintentar",
  async function (this: CustomWorld) {
    const errorAlert = this.page.getByRole("alert").filter({
      hasText: /error|no se pud/i,
    });
    await errorAlert.waitFor({ state: "visible" });
    const retryButton = this.page.getByRole("button", { name: "Reintentar" });
    await retryButton.waitFor({ state: "visible" });
  },
);

Given(
  "que existen los siguientes prestadores registrados:",
  async function (this: CustomWorld, dataTable: DataTable) {
    const providers = dataTable.hashes().map((row, index) => {
      const rawZones = row.zonas ?? row.zona ?? "";
      const zones = rawZones
        .split(",")
        .map((z) => z.trim())
        .filter(Boolean)
        .map((z, zIdx) => ({
          id: zIdx + 1,
          name: z,
          code: z.toLowerCase().replace(/\s+/g, "_"),
        }));

      return {
        id: index + 1,
        role: "provider",
        name: row.nombre,
        surname: row.apellido,
        email: row.correo,
        profile_photo_url: `https://example.com/photos/${row.nombre.toLowerCase()}.jpg`,
        created_on: "2026-09-10",
        category: {
          id: 10 + index,
          name: row.rubro,
        },
        coverage_zones: zones,
        identity_verification_status: row.estado_verificacion ?? "approved",
      };
    });
    await this.stubGet("/admin/providers", providers);
  },
);

When("ingreso al directorio de prestadores", async function (this: CustomWorld) {
  if (!this.page.url().includes(ROUTES.users)) {
    await this.page.goto(new URL(ROUTES.users, this.appUrl).href);
  }
  const providersTab = this.page.getByRole("tab", { name: /prestadores/i });
  await providersTab.waitFor({ state: "visible" });
  await providersTab.click();
});

Then(
  "veo el listado de prestadores con su rubro, zonas de cobertura y estado de verificación",
  async function (this: CustomWorld) {
    const panel = this.page.locator("#panel-providers");
    await panel.waitFor({ state: "visible" });
    const table = panel.getByRole("table");
    await table.waitFor({ state: "visible" });
    const rows = panel.locator("tbody tr");
    await rows.first().waitFor({ state: "visible" });
    assert.equal(await rows.count(), 1);

    const row0 = rows.nth(0);
    const text0 = await row0.innerText();
    assert.ok(text0.includes("Juan"));
    assert.ok(text0.includes("Gómez"));
    assert.ok(text0.includes("juan@example.com"));
    assert.ok(text0.includes("Plomería"));
    assert.ok(text0.includes("Comuna 6"));
    assert.ok(text0.includes("Comuna 14"));
    assert.ok(text0.includes("Verificado"));
  },
);

Given(
  "que la consulta del directorio de prestadores tarda en responder",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/providers",
      status: 200,
      body: [],
      delayMs: 3000,
    });
  },
);

Given(
  "que no existen prestadores que coincidan con los filtros aplicados",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/providers", []);
  },
);

When(
  "aplico los filtros en el directorio de prestadores",
  async function (this: CustomWorld) {
    if (!this.page.url().includes(ROUTES.users)) {
      await this.page.goto(new URL(ROUTES.users, this.appUrl).href);
    }
    const providersTab = this.page.getByRole("tab", { name: /prestadores/i });
    await providersTab.waitFor({ state: "visible" });
    await providersTab.click();
  },
);

Then(
  "veo un mensaje indicando que no hay prestadores disponibles",
  async function (this: CustomWorld) {
    const panel = this.page.locator("#panel-providers");
    await panel.waitFor({ state: "visible" });
    const emptyMessage = panel.getByRole("status").filter({
      hasText: "No hay prestadores disponibles",
    });
    await emptyMessage.waitFor({ state: "visible" });
  },
);
