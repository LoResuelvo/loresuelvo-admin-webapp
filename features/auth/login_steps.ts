import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import { observeSignInRedirect } from "../support/login-navigation";


Given("que no tengo una sesión activa", async function (this: CustomWorld) {
  await this.context.clearCookies();
});

When("entro a la página de inicio", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.home, this.appUrl).href);
});

Then("veo la identidad de Lo Resuelvo y el botón {string}", async function (this: CustomWorld, label: string) {
  await this.page.getByText("Lo Resuelvo", { exact: true }).waitFor();
  await this.page.getByRole("button", { name: label, exact: true }).waitFor();
});

Then("no veo un formulario de contraseña ni una opción de registro", async function (this: CustomWorld) {
  assert.equal(await this.page.locator('input[type="password"]').count(), 0);
  assert.equal(await this.page.getByRole("textbox").count(), 0);
  assert.equal(await this.page.getByText(/registr|crear cuenta/i).count(), 0);
});

Given("que estoy en la página de inicio", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.home, this.appUrl).href);
});

When("hago clic en el botón {string}", async function (this: CustomWorld, label: string) {
  await observeSignInRedirect(this);
  await this.page.getByRole("button", { name: label, exact: true }).click();
});

Then("soy redirigido al portal de autenticación de Auth0", async function (this: CustomWorld) {
  await this.page.waitForURL((url) => url.pathname === "/authorize");
  assert.equal(new URL(this.page.url()).origin, "https://auth0.admin.test");
  await this.page.getByRole("heading", { name: "Auth0 Test Portal" }).waitFor();
});

Then("no puedo iniciar otra solicitud mientras se procesa la redirección", async function (this: CustomWorld) {
  assert.equal(this.signInDisabledDuringRedirect, true);
  assert.equal(this.signInRequestCount, 1);
});
