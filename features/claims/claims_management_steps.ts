import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import {
  sampleClaimsListResponse,
  sampleFilterClaimsResponse,
  sampleClaimDetailResponse,
} from "./claims_fixtures";

Given("que existen reclamos formales registrados en el sistema", async function (this: CustomWorld) {
  await this.stubGet("/admin/claims", sampleClaimsListResponse);
});

When("accedo a la sección de reclamos en {string}", async function (this: CustomWorld, path: string) {
  const claimsPath = (ROUTES as unknown as Record<string, string>).claims ?? path;
  await this.page.goto(new URL(claimsPath, this.appUrl).href);
});

Then(
  "visualizo el listado de quejas con la fecha, reclamante, rubro, estado y nivel de urgencia",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    const row0 = rows.nth(0);
    const text0 = await row0.innerText();
    assert.ok(text0.includes("Ana Gómez"));
    assert.ok(text0.includes("Plomería"));
    assert.ok(text0.toLowerCase().includes("revisión") || text0.toLowerCase().includes("revision") || text0.includes("En revisión"));
    assert.ok(text0.toLowerCase().includes("alta") || text0.includes("Alta"));

    const row1 = rows.nth(1);
    const text1 = await row1.innerText();
    assert.ok(text1.includes("Martín Pérez"));
    assert.ok(text1.includes("Electricidad"));
    assert.ok(text1.toLowerCase().includes("abierto") || text1.includes("Abierto"));
    assert.ok(text1.toLowerCase().includes("media") || text1.includes("Media"));
  },
);

Given(
  "que existen reclamos abiertos y resueltos de diferentes participantes",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/claims", sampleFilterClaimsResponse);
  },
);

When(
  "filtro por estado {string} y busco el apellido {string}",
  async function (this: CustomWorld, statusLabel: string, searchSurname: string) {
    const claimsPath = (ROUTES as unknown as Record<string, string>).claims ?? "/reclamos";
    await this.page.goto(new URL(claimsPath, this.appUrl).href);

    const statusSelect = this.page.getByLabel("Filtrar por estado");
    await statusSelect.waitFor();
    await statusSelect.selectOption({ label: statusLabel });

    const searchInput = this.page.getByPlaceholder("Buscar por participante...");
    await searchInput.fill(searchSurname);
  },
);

Then(
  "el listado presenta únicamente las disputas abiertas vinculadas al participante buscado",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    await this.page.waitForFunction(
      () => document.querySelectorAll("tbody tr").length === 1,
      null,
      { timeout: 5000 },
    );
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 1);

    const rowText = await rows.first().innerText();
    assert.ok(rowText.includes("López") || rowText.includes("Lopez"));
    assert.ok(rowText.toLowerCase().includes("abierto") || rowText.includes("Abierto"));
    assert.ok(!rowText.includes("Pedro Martínez"));
    assert.ok(!rowText.includes("Juan Silva"));
  },
);

Given(
  "que existe un reclamo en estado {string} con ID {string}",
  async function (this: CustomWorld, _statusLabel: string, claimId: string) {
    await this.stubGet(`/admin/claims/${claimId}`, sampleClaimDetailResponse);
  },
);

When(
  "accedo al expediente del reclamo en {string}",
  async function (this: CustomWorld, path: string) {
    await this.page.goto(new URL(path, this.appUrl).href);
  },
);

Then(
  "visualizo la descripción del conflicto, las fotos de evidencia y el enlace directo hacia la contratación asociada",
  async function (this: CustomWorld) {
    const description = this.page.locator('[data-testid="claim-description"]');
    await description.waitFor();
    const text = await description.innerText();
    assert.ok(
      text.includes("El prestador se presentó dos horas tarde") ||
        text.includes("Incumplimiento de horario y cobro indebido"),
    );

    const photos = this.page.locator('[data-testid="claim-evidence-gallery"] img');
    await photos.first().waitFor();
    const count = await photos.count();
    assert.ok(count >= 2);

    const opLink = this.page.locator('[data-testid="operation-link"]');
    await opLink.waitFor();
    const href = await opLink.getAttribute("href");
    assert.ok(href?.includes("/operaciones/42"));
  },
);

Given(
  "que la consulta del expediente del reclamo toma unos momentos",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/claims/clm-101",
      status: 200,
      body: sampleClaimDetailResponse,
      delayMs: 3000,
    });
  },
);

When(
  "accedo al detalle del reclamo",
  async function (this: CustomWorld) {
    await this.page.goto(new URL("/reclamos/clm-101", this.appUrl).href);
  },
);

Then(
  "se presenta una vista de carga con indicadores visuales mientras se obtienen los antecedentes",
  async function (this: CustomWorld) {
    const skeleton = this.page.getByTestId("claim-detail-skeleton");
    await skeleton.waitFor({ state: "visible" });
    assert.equal(await skeleton.getAttribute("aria-busy"), "true");
    const indicators = this.page.locator("[data-testid='skeleton-indicator']");
    assert.ok((await indicators.count()) >= 1);
  },
);


