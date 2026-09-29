import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import {
  sampleReportedReviewsListResponse,
  sampleMixedReviewsListResponse,
} from "./review_fixtures";

Given(
  "que existen reseñas denunciadas por usuarios en el marketplace",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/reviews", sampleReportedReviewsListResponse);
  },
);

When("accedo a la sección de moderación", async function (this: CustomWorld) {
  const moderationPath =
    (ROUTES as unknown as Record<string, string>).moderation ?? "/moderacion";
  await this.page.goto(new URL(moderationPath, this.appUrl).href);
});

Then(
  "visualizo el listado de reseñas con el autor, prestador calificado, calificación, comentario y motivo del reporte",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    const row0 = rows.nth(0);
    const text0 = await row0.innerText();
    assert.ok(text0.includes("Lucía Fernández"));
    assert.ok(text0.includes("Roberto Gómez"));
    assert.ok(text0.includes("1"));
    assert.ok(text0.includes("El trabajo fue pésimo"));
    assert.ok(text0.includes("Lenguaje agraviante y trato ofensivo"));

    const row1 = rows.nth(1);
    const text1 = await row1.innerText();
    assert.ok(text1.includes("Esteban Morales"));
    assert.ok(text1.includes("Clara Domínguez"));
    assert.ok(text1.includes("2"));
    assert.ok(text1.includes("Publicó mis datos personales"));
    assert.ok(text1.includes("Divulgación de datos personales"));
  },
);

Given(
  "que existen reseñas visibles, reportadas y ocultadas",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/reviews", sampleMixedReviewsListResponse);
  },
);

When(
  "filtro el listado por estado {string}",
  async function (this: CustomWorld, statusLabel: string) {
    const moderationPath =
      (ROUTES as unknown as Record<string, string>).moderation ?? "/moderacion";
    if (!this.page.url().includes(moderationPath)) {
      await this.page.goto(new URL(moderationPath, this.appUrl).href);
    }
    const filterElement = this.page
      .getByRole("tab", { name: new RegExp(statusLabel, "i") })
      .or(this.page.getByRole("button", { name: new RegExp(statusLabel, "i") }));
    await filterElement.waitFor();
    await filterElement.click();
  },
);

Then(
  "el listado presenta únicamente las reseñas que fueron retiradas de la vista pública",
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
    assert.ok(rowText.includes("Lucas Benítez"));
    assert.ok(rowText.includes("Florencia Peña"));
    assert.ok(rowText.includes("Ocultada"));
    assert.ok(!rowText.includes("Gonzalo Arias"));
    assert.ok(!rowText.includes("Mariana Paz"));
  },
);
