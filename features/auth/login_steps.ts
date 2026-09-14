import { When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";

When("inicio sesión como administrador", async function (this: CustomWorld) {
  await this.setSession("admin");
});

Then("veo el panel principal de administración", async function (this: CustomWorld) {
  // Step de verificación
});
