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

When("ingreso al área de administración", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.admin, this.appUrl).href);
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
