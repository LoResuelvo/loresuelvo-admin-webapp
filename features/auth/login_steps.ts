import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import { anAdminProfile, stubAdminAccess, stubRefreshedAdminAccess } from "../support/admin-access";
import { observeSignInRedirect } from "../support/login-navigation";


Given("que no tengo una sesión activa", async function (this: CustomWorld) {
  await this.context.clearCookies();
  this.page.on("request", request => {
    if (request.isNavigationRequest() && request.frame() === this.page.mainFrame()) this.adminDocumentRequestCount += 1;
  });
  await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, route => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ status: "unauthenticated" }) }));
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

Given(/^que todavía se está verificando (?:mi sesión|mi perfil)$/, async function (this: CustomWorld) {
  await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, () => {});
});

When("entro al área de administración", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.admin, this.appUrl).href);
});

Then("veo un mensaje que indica que se está verificando mi acceso", async function (this: CustomWorld) {
  await this.page.getByRole("status").getByText("Estamos verificando tu acceso…").waitFor();
});

Then("no veo contenido administrativo", async function (this: CustomWorld) {
  assert.equal(await this.page.getByRole("region", { name: "Área de administración" }).count(), 0);
});

Given("que inicié sesión exitosamente en Auth0", async function (this: CustomWorld) {
  await this.context.clearCookies();
});

Given("tengo una cuenta de administrador habilitada con nombre {string}, apellido {string} y correo {string}", async function (this: CustomWorld, firstName: string, lastName: string, email: string) {
  await stubAdminAccess(this, anAdminProfile({ firstName, lastName, email }));
});

Then("veo mi nombre {string}, apellido {string} y correo {string}", async function (this: CustomWorld, firstName: string, lastName: string, email: string) {
  await this.page.getByRole("banner").getByText(`${firstName} ${lastName}`, { exact: true }).waitFor();
  await this.page.getByRole("banner").getByText(email, { exact: true }).waitFor();
});

Then("puedo acceder al área de administración", async function (this: CustomWorld) {
  await this.page.getByRole("region", { name: "Área de administración" }).waitFor();
});


When("entro directamente al área de administración", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.admin, this.appUrl).href);
});

Then("se me ofrece iniciar sesión", async function (this: CustomWorld) {
  await this.page.getByRole("button", { name: "Iniciar sesión", exact: true }).waitFor();
});

Then("no soy redirigido repetidamente", async function (this: CustomWorld) {
  assert.equal(new URL(this.page.url()).pathname, ROUTES.admin);
  assert.equal(this.adminDocumentRequestCount, 1);
});

Given("que tengo una sesión activa", async function (this: CustomWorld) {
  await this.context.clearCookies();
});

Given("tengo una cuenta de administrador habilitada en Lo Resuelvo", async function (this: CustomWorld) {
  await stubRefreshedAdminAccess(this);
});

Given("estoy en el área de administración", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.admin, this.appUrl).href);
  await this.page.getByRole("banner").getByText("Ana Pérez", { exact: true }).waitFor();
});

When("recargo la página", async function (this: CustomWorld) {
  await this.page.reload();
});

Then("vuelvo a acceder al área de administración con mi identidad verificada", async function (this: CustomWorld) {
  await this.page.getByRole("region", { name: "Área de administración" }).waitFor();
  await this.page.getByRole("banner").getByText("Ana Pérez García", { exact: true }).waitFor();
  await this.page.getByRole("banner").getByText("ana@example.com", { exact: true }).waitFor();
  assert.equal(this.adminAccessRequestCount, 2);
});

Given("que mi autenticación dejó de ser válida", async function (this: CustomWorld) {
  this.page.on("request", request => {
    if (request.isNavigationRequest() && request.frame() === this.page.mainFrame()) this.adminDocumentRequestCount += 1;
  });
  await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, route => route.fulfill({
    status: 401, contentType: "application/json", body: JSON.stringify({ status: "sessionExpired" }),
  }));
});

Then("veo un mensaje que indica que debo iniciar sesión nuevamente", async function (this: CustomWorld) {
  await this.page.getByRole("alert").getByText("Iniciá sesión nuevamente para continuar.").waitFor();
  await this.page.getByRole("button", { name: "Iniciar sesión", exact: true }).waitFor();
});

Given("mi cuenta no está habilitada en Lo Resuelvo", async function (this: CustomWorld) {
  await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, route => route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ status: "notProvisioned" }) }));
});

Then("veo un mensaje que indica que mi cuenta no está habilitada y que debo contactar al responsable del entorno", async function (this: CustomWorld) {
  await this.page.getByRole("alert").getByText("Tu cuenta no está habilitada en Lo Resuelvo. Contactá al responsable del entorno.").waitFor();
});

Then("no veo contenido administrativo ni una opción de registro", async function (this: CustomWorld) {
  assert.equal(await this.page.getByRole("region", { name: "Área de administración" }).count(), 0);
  assert.equal(await this.page.getByText(/registr|crear cuenta/i).count(), 0);
});

Given(/^mi cuenta de Lo Resuelvo es de (?:cliente|prestador)$/, async function (this: CustomWorld) {
  await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, route => route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ status: "forbidden" }) }));
});

Then("veo un mensaje que indica que el acceso está reservado a administradores", async function (this: CustomWorld) {
  await this.page.getByRole("alert").getByText("Este acceso está reservado a administradores de Lo Resuelvo.").waitFor();
});

Given("el servicio de consulta de mi perfil no está disponible", async function (this: CustomWorld) {
  await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ status: "unavailable" }) }));
});

Then("veo un mensaje que informa que no se pudo verificar mi acceso", async function (this: CustomWorld) {
  await this.page.getByRole("alert").getByText("No se pudo verificar tu acceso. Intentá nuevamente más tarde.").waitFor();
});

Then("veo la opción {string}", async function (this: CustomWorld, label: string) {
  await this.page.getByRole("button", { name: label, exact: true }).waitFor();
});

Then("no se informa que mi cuenta no está habilitada", async function (this: CustomWorld) {
  assert.equal(await this.page.getByText(/Tu cuenta no está habilitada/).count(), 0);
});

Given("que veo un error temporal al verificar mi acceso", async function (this: CustomWorld) {
  await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, route => route.fulfill({
    status: 503, contentType: "application/json", body: JSON.stringify({ status: "unavailable" }),
  }));
  await this.page.goto(new URL(ROUTES.admin, this.appUrl).href);
  await this.page.getByRole("alert").getByText("No se pudo verificar tu acceso. Intentá nuevamente más tarde.").waitFor();
});

Given("el servicio de consulta de mi perfil vuelve a estar disponible", async function (this: CustomWorld) {
  await this.page.unroute(new URL(ROUTES.adminAccess, this.appUrl).href);
});

When("hago clic en {string}", async function (this: CustomWorld, label: string) {
  await this.page.getByRole("button", { name: label, exact: true }).click();
});

Then("accedo al área de administración con mi identidad verificada", async function (this: CustomWorld) {
  await this.page.getByRole("region", { name: "Área de administración" }).waitFor();
  await this.page.getByRole("banner").getByText("Ana Pérez", { exact: true }).waitFor();
  await this.page.getByRole("banner").getByText("ana@example.com", { exact: true }).waitFor();
  assert.equal(this.adminAccessRequestCount, 1);
  assert.equal(await this.page.getByRole("button", { name: "Reintentar" }).count(), 0);
});
