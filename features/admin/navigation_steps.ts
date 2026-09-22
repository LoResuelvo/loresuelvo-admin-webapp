import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import { anAdminProfile, stubAdminAccess } from "../support/admin-access";

Given(
  "que estoy autenticado como administrador con nombre {string}, apellido {string} y correo {string}",
  async function (this: CustomWorld, firstName: string, lastName: string, email: string) {
    await this.context.clearCookies();
    await stubAdminAccess(this, anAdminProfile({ firstName, lastName, email }));
  },
);

Given("que estoy autenticado como administrador", async function (this: CustomWorld) {
  await this.context.clearCookies();
  await stubAdminAccess(this, anAdminProfile());
  await this.page.route(/\/auth\/logout(?:\?|$)/, async (route) => {
    await this.context.clearCookies();
    await this.page.route(new URL(ROUTES.adminAccess, this.appUrl).href, (r) =>
      r.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ status: "unauthenticated" }),
      }),
    );
    await route.fulfill({
      status: 302,
      headers: { Location: new URL(ROUTES.home, this.appUrl).href },
    });
  });
});

When("ingreso al área de administración", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.admin, this.appUrl).href);
});

When("navego a la sección {string}", async function (this: CustomWorld, sectionName: string) {
  await this.page.getByRole("link", { name: sectionName, exact: true }).click();
});

Then(
  "veo la identidad {string} y el indicador {string}",
  async function (this: CustomWorld, brand: string, indicator: string) {
    await this.page.getByRole("banner").getByText(brand, { exact: true }).waitFor();
    await this.page.getByRole("banner").getByText(indicator, { exact: true }).waitFor();
  },
);

Then(
  "veo los enlaces de navegación {string} y {string}",
  async function (this: CustomWorld, link1: string, link2: string) {
    await this.page.getByRole("link", { name: link1, exact: true }).waitFor();
    await this.page.getByRole("link", { name: link2, exact: true }).waitFor();
  },
);

Then("accedo a la sección de rubros", async function (this: CustomWorld) {
  await this.page.waitForURL((url) => url.pathname === ROUTES.categories);
  await this.page.getByRole("region", { name: "Catálogo de Rubros" }).waitFor();
});

Then(
  "el enlace {string} se muestra como ruta activa",
  async function (this: CustomWorld, linkName: string) {
    const link = this.page.getByRole("link", { name: linkName, exact: true });
    await link.waitFor();
    const ariaCurrent = await link.getAttribute("aria-current");
    assert.equal(ariaCurrent, "page");
  },
);

Then("soy redirigido a la página de bienvenida pública", async function (this: CustomWorld) {
  await this.page.waitForURL((url) => url.pathname === ROUTES.home);
  await this.page.getByText("Lo Resuelvo", { exact: true }).waitFor();
  await this.page.getByRole("button", { name: "Iniciar sesión", exact: true }).waitFor();
});

Then(
  "si intento ingresar nuevamente al área de administración se me deniega el acceso",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.admin, this.appUrl).href);
    await this.page.getByRole("button", { name: "Iniciar sesión", exact: true }).waitFor();
    assert.equal(await this.page.getByRole("region", { name: "Área de administración" }).count(), 0);
  },
);

