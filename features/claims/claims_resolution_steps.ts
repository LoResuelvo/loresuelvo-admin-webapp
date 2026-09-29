import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { sampleClaimDetailOpenResponse } from "./claims_fixtures";

Given(
  "que me encuentro en el formulario de dictamen del reclamo",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/claims/clm-101", sampleClaimDetailOpenResponse);
    await this.page.goto(new URL("/reclamos/clm-101", this.appUrl).href);
    const openModalBtn = this.page.getByRole("button", {
      name: /dictaminar resolución|resolver reclamo/i,
    });
    await openModalBtn.waitFor();
    await openModalBtn.click();
    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();
  },
);

When(
  "intento confirmar la resolución sin completar el motivo justificado",
  async function (this: CustomWorld) {
    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();
    const reasonInput = dialog.getByLabel(/motivo justificado|fundamentación/i);
    await reasonInput.fill("");
    const submitBtn = dialog.getByRole("button", {
      name: /confirmar dictamen|registrar resolución/i,
    });
    await submitBtn.click();
  },
);

Then(
  "veo un mensaje indicando que el motivo de resolución es obligatorio",
  async function (this: CustomWorld) {
    const dialog = this.page.getByRole("dialog");
    const errorAlert = dialog.getByRole("alert");
    await errorAlert.waitFor();
    const text = await errorAlert.innerText();
    assert.ok(text.includes("El motivo de resolución es obligatorio"));
  },
);

Then("el formulario no se envía", async function (this: CustomWorld) {
  const dialog = this.page.getByRole("dialog");
  assert.equal(await dialog.isVisible(), true);
  const statusBadge = this.page.locator('[data-testid="claim-status-badge"]');
  const statusText = await statusBadge.innerText();
  assert.ok(!statusText.includes("Resuelto"));
});

Given(
  "que el servidor de soporte experimenta inconvenientes",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/claims/clm-101", sampleClaimDetailOpenResponse);
    await this.stubPost("/admin/claims/clm-101/resolution", 500, {
      error: "Internal Server Error",
    });
  },
);

When(
  "intento registrar el dictamen de un reclamo",
  async function (this: CustomWorld) {
    await this.page.goto(new URL("/reclamos/clm-101", this.appUrl).href);
    const openModalBtn = this.page.getByRole("button", {
      name: /dictaminar resolución|resolver reclamo/i,
    });
    await openModalBtn.waitFor();
    await openModalBtn.click();

    const dialog = this.page.getByRole("dialog");
    await dialog.waitFor();

    const reasonInput = dialog.getByLabel(/motivo justificado|fundamentación/i);
    await reasonInput.fill("Incumplimiento verificado de visita pactada");

    const submitBtn = dialog.getByRole("button", {
      name: /confirmar dictamen|registrar resolución/i,
    });
    await submitBtn.click();
  },
);

