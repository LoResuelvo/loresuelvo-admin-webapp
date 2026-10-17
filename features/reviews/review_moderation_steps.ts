import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import {
  sampleReportedReviewsListResponse,
  sampleMixedReviewsListResponse,
  sampleModeratedOffensiveReviewResponse,
  sampleHiddenReviewListResponse,
  sampleRestoredReviewResponse,
  sampleReportedReviewDetail,
  sampleHiddenReviewDetail,
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
  "visualizo el listado con los IDs de consumidor y prestador, contratación, calificación, reportes pendientes y fecha del reporte",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    const row0 = rows.nth(0);
    const text0 = await row0.innerText();
    assert.ok(text0.includes("10"));
    assert.ok(text0.includes("20"));
    assert.ok(text0.includes("work_order-101"));
    assert.ok(text0.includes("1"));
    assert.ok(text0.includes("25/09/2026"));

    const row1 = rows.nth(1);
    const text1 = await row1.innerText();
    assert.ok(text1.includes("11"));
    assert.ok(text1.includes("21"));
    assert.ok(text1.includes("work_order-102"));
    assert.ok(text1.includes("2"));
    assert.ok(text1.includes("24/09/2026"));
  },
);

Given(
  "que existen reseñas visibles, reportadas y ocultadas",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/reviews", sampleMixedReviewsListResponse);
  },
);

When(
  "filtro el listado por visibilidad {string}",
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
    assert.ok(rowText.includes("13"));
    assert.ok(rowText.includes("23"));
    assert.ok(rowText.includes("work_order-203"));
    assert.ok(rowText.includes("Ocultada"));
    assert.ok(!rowText.includes("Gonzalo Arias"));
    assert.ok(!rowText.includes("Mariana Paz"));
  },
);

Given(
  "que identifico una reseña reportada con lenguaje agraviante",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/reviews", sampleReportedReviewsListResponse);
    await this.stubPost(
      "/admin/reviews/101/moderate",
      200,
      sampleModeratedOffensiveReviewResponse,
    );
    await this.stubGet("/admin/reviews/101", sampleReportedReviewDetail);
    const moderationPath =
      (ROUTES as unknown as Record<string, string>).moderation ?? "/moderacion";
    await this.page.goto(new URL(moderationPath, this.appUrl).href);
  },
);

When(
  "oculto la reseña seleccionando la infracción {string} y detallando el motivo",
  async function (this: CustomWorld, infractionCategoryLabel: string) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const hideButton = this.page
      .getByRole("button", { name: /^ocultar$/i })
      .or(this.page.getByRole("button", { name: /ocultar reseña/i }))
      .first();
    await hideButton.waitFor();
    await hideButton.click();

    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();

    const categorySelect = dialog.getByLabel(/categoría de infracción/i);
    await categorySelect.waitFor();
    await categorySelect.selectOption({ label: infractionCategoryLabel });

    const reasonTextarea = dialog.getByLabel(/motivo/i);
    await reasonTextarea.waitFor();
    await reasonTextarea.fill("Lenguaje ofensivo hacia el prestador");

    const confirmButton = dialog.getByRole("button", { name: /ocultar reseña/i });
    await confirmButton.click();
  },
);

Then(
  "el estado de la reseña pasa a {string}",
  async function (this: CustomWorld, expectedStatus: string) {
    const statusCell = this.page
      .locator("tbody tr")
      .first()
      .getByText(new RegExp(`^${expectedStatus}$`, "i"));
    await statusCell.waitFor();
    assert.ok(await statusCell.isVisible());
  },
);

Then(
  "veo una confirmación de la moderación aplicada",
  async function (this: CustomWorld) {
    const feedback = this.page.locator('[data-testid="moderation-feedback"]');
    await feedback.waitFor();
    const text = await feedback.innerText();
    assert.ok(
      text.toLowerCase().includes("ocultada") ||
        text.toLowerCase().includes("éxito") ||
        text.toLowerCase().includes("correctamente"),
    );
  },
);

Given(
  'que existe una reseña en estado "Ocultada"',
  async function (this: CustomWorld) {
    await this.stubGet("/admin/reviews", sampleHiddenReviewListResponse);
    await this.stubGet("/admin/reviews/203", sampleHiddenReviewDetail);
    await this.stubPost(
      "/admin/reviews/203/moderate",
      200,
      sampleRestoredReviewResponse,
    );
    const moderationPath =
      (ROUTES as unknown as Record<string, string>).moderation ?? "/moderacion";
    await this.page.goto(new URL(moderationPath, this.appUrl).href);
  },
);

When(
  "solicito restablecer la visibilidad pública e indico un motivo",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const restoreButton = this.page
      .getByRole("button", { name: /restablecer/i })
      .first();
    await restoreButton.waitFor();
    await restoreButton.click();
    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();
    await dialog.getByLabel(/motivo detallado/i).fill("Revisión solicitada por el autor");
    await dialog.getByRole("button", { name: /restablecer visibilidad/i }).click();
  },
);

Then(
  "el estado de la reseña pasa nuevamente a {string}",
  async function (this: CustomWorld, expectedStatus: string) {
    const statusCell = this.page
      .locator("tbody tr")
      .first()
      .getByText(new RegExp(`^${expectedStatus}$`, "i"));
    await statusCell.waitFor();
    assert.ok(await statusCell.isVisible());
  },
);

Then(
  "veo una confirmación del restablecimiento aplicado",
  async function (this: CustomWorld) {
    const feedback = this.page.locator('[data-testid="moderation-feedback"]');
    await feedback.waitFor();
    const text = await feedback.innerText();
    assert.ok(
      text.toLowerCase().includes("restablecida") ||
        text.toLowerCase().includes("visible") ||
        text.toLowerCase().includes("éxito") ||
        text.toLowerCase().includes("correctamente"),
    );
  },
);

Given(
  "que me encuentro en el formulario de moderación de una reseña",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/reviews", sampleReportedReviewsListResponse);
    await this.stubGet("/admin/reviews/101", sampleReportedReviewDetail);
    const moderationPath =
      (ROUTES as unknown as Record<string, string>).moderation ?? "/moderacion";
    await this.page.goto(new URL(moderationPath, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor();
    const hideButton = this.page
      .getByRole("button", { name: /^ocultar$/i })
      .or(this.page.getByRole("button", { name: /ocultar reseña/i }))
      .first();
    await hideButton.waitFor();
    await hideButton.click();
    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();
    await dialog.getByLabel(/categoría de infracción/i).waitFor({ state: "visible" });
  },
);

When(
  "intento confirmar la moderación sin seleccionar una categoría de infracción",
  async function (this: CustomWorld) {
    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();
    const confirmButton = dialog.getByRole("button", { name: /ocultar reseña/i });
    await confirmButton.waitFor();
    await confirmButton.click();
  },
);

Then(
  "veo un mensaje indicando que la categoría de infracción es requerida",
  async function (this: CustomWorld) {
    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();
    const errorMessage = dialog
      .getByRole("alert")
      .or(dialog.getByText(/la categoría de infracción es requerida/i));
    await errorMessage.waitFor();
    assert.ok(await errorMessage.isVisible());
  },
);

Then("la acción no se procesa", async function (this: CustomWorld) {
  const dialog = this.page.getByRole("dialog");
  assert.ok(await dialog.isVisible());
});

Given(
  "que la consulta de reseñas toma unos momentos",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/reviews",
      status: 200,
      body: sampleReportedReviewsListResponse,
      delayMs: 800,
    });
  },
);

Then(
  "se presenta una vista de carga con indicadores visuales mientras se recuperan los comentarios",
  async function (this: CustomWorld) {
    const loadingView = this.page.locator(
      '[role="status"][aria-busy="true"][aria-label="Cargando comentarios..."]',
    );
    await loadingView.waitFor({ state: "visible", timeout: 3000 });
    assert.ok(await loadingView.isVisible());

    const pulseIndicator = loadingView.locator(".animate-pulse").first();
    assert.ok(await pulseIndicator.isVisible());

    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible", timeout: 5000 });
  },
);

Given(
  "que mi cuenta de usuario no posee permisos de moderación",
  async function (this: CustomWorld) {
    await this.stubGet(
      "/admin/reviews",
      { error: "Forbidden", message: "User lacks moderation permission" },
      403,
    );
  },
);

When(
  "intento ingresar a la sección de moderación",
  async function (this: CustomWorld) {
    const moderationPath =
      (ROUTES as unknown as Record<string, string>).moderation ?? "/moderacion";
    await this.page.goto(new URL(moderationPath, this.appUrl).href);
  },
);

Given(
  "que el servicio de moderación experimenta dificultades de red",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/reviews", sampleReportedReviewsListResponse);
    await this.stubGet("/admin/reviews/101", sampleReportedReviewDetail);
    await this.stubPost("/admin/reviews/101/moderate", 500, {
      error: "Internal Server Error",
      message: "Error temporal de conexión con el servicio",
    });
    const moderationPath =
      (ROUTES as unknown as Record<string, string>).moderation ?? "/moderacion";
    await this.page.goto(new URL(moderationPath, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
  },
);

When(
  "intento confirmar la moderación de una reseña",
  async function (this: CustomWorld) {
    const hideButton = this.page
      .getByRole("button", { name: /^ocultar$/i })
      .or(this.page.getByRole("button", { name: /ocultar reseña/i }))
      .first();
    await hideButton.waitFor({ state: "visible" });
    await hideButton.click();

    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor({ state: "visible" });

    const categorySelect = dialog.getByLabel(/categoría de infracción/i);
    await categorySelect.waitFor({ state: "visible" });
    await categorySelect.selectOption({ value: "abusive_language" });

    const reasonTextarea = dialog.getByLabel(/motivo/i);
    await reasonTextarea.waitFor({ state: "visible" });
    await reasonTextarea.fill("Comentario con términos inapropiados");

    const confirmButton = dialog.getByRole("button", { name: /ocultar reseña/i });
    await confirmButton.waitFor({ state: "visible" });
    await confirmButton.click();
  },
);


