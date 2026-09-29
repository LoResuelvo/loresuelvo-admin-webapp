import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import { sampleReportedReviewsListResponse } from "./review_fixtures";

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
