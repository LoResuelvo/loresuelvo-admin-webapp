import { ROUTES } from "@/lib/routes";
import type { CustomWorld } from "./world";

declare global {
  interface Window { recordSignInPending?: () => Promise<void>; }
}

export async function observeSignInRedirect(world: CustomWorld) {
  const signInUrl = new URL(ROUTES.signIn, world.appUrl).href;
  await world.page.route(signInUrl, (route) =>
    route.fulfill({
      contentType: "text/html",
      // A fresh navigation remains interceptable; Playwright skips redirected requests.
      body: '<script>location.replace("https://auth0.admin.test/authorize")</script>',
    }),
  );
  await world.page.route(/^https:\/\/auth0\.admin\.test\/authorize(?:\?|$)/, (route) =>
    route.fulfill({ contentType: "text/html", body: "<h1>Auth0 Test Portal</h1>" }),
  );
  await world.page.exposeFunction("recordSignInPending", () => {
    world.signInDisabledDuringRedirect = true;
  });
  await world.page.evaluate(() => {
    const button = document.querySelector("button");
    if (!button) throw new Error("Sign-in button is missing");
    const observer = new MutationObserver(() => {
      if (!button.disabled) return;
      observer.disconnect();
      void window.recordSignInPending?.();
    });
    observer.observe(button, { attributes: true, attributeFilter: ["disabled"] });
  });
  world.page.on("request", (request) => {
    if (request.url() === signInUrl) world.signInRequestCount += 1;
  });
}
