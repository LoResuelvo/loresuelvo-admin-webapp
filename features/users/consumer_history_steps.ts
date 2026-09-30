import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

import {
  defaultConsumerHistory,
  emptyConsumer,
  multipleInteractionsConsumer,
} from "./consumer_history_fixtures";

Given("que existe un consumidor registrado en el marketplace", async function (this: CustomWorld) {
  await this.stubGet("/admin/consumers/301/history?limit=20", defaultConsumerHistory);
});

When("consulto la ficha del consumidor", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
});

Then(
  "visualizo sus datos de contacto, fecha de registro y la dirección habitual registrada",
  async function (this: CustomWorld) {
    const header = this.page.getByTestId("consumer-profile-header");
    await header.waitFor({ state: "visible" });

    const text = await this.page.locator("body").innerText();
    assert.ok(text.includes("Carlos López"), "Debe mostrar el nombre completo");
    assert.ok(text.includes("carlos@example.com"), "Debe mostrar el correo electrónico");
    assert.ok(text.includes("No disponible"), "Debe indicar que el teléfono no está disponible en la API");
    assert.ok(text.includes("Av. Rivadavia 4500"), "Debe mostrar la dirección habitual");
    assert.ok(text.includes("Comuna 6"), "Debe mostrar la zona de cobertura");
    assert.ok(text.includes("01/09/2026"), "Debe mostrar la fecha de registro formateada");
  },
);

Given(
  "que el consumidor registra actividad de contrataciones en la plataforma",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/consumers/301/history?limit=20", defaultConsumerHistory);
  },
);

When("consulto el historial en la ficha del consumidor", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
});

Then(
  "visualizo la lista cronológica de servicios con fecha, rubro, prestador asignado, estado y acceso al detalle operativo",
  async function (this: CustomWorld) {
    const list = this.page.getByTestId("consumer-history-list");
    await list.waitFor({ state: "visible" });

    const text = await list.innerText();
    assert.ok(text.includes("20/09/2026"), "Debe mostrar la fecha de la orden");
    assert.ok(text.includes("No disponible"), "Debe indicar que el rubro histórico no está disponible en la API");
    assert.ok(text.includes("Juan Gómez"), "Debe mostrar el nombre del prestador");
    assert.ok(text.toLowerCase().includes("completad"), "Debe mostrar el estado");

    const detailLink = list.locator(`a[href="${ROUTES.operationDetail("jr-105")}"]`);
    assert.equal(await detailLink.count(), 1, "Debe tener un enlace al detalle operativo con identidad canónica jr-105");
  },
);

Given(
  "que el consumidor posee múltiples interacciones registradas",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/consumers/301/history?limit=20", multipleInteractionsConsumer);
    await this.stubGet("/admin/consumers/301/history?type=work_order&limit=20", defaultConsumerHistory);
    await this.stubGet("/admin/consumers/301/history?type=work_order&status=paid&limit=20", defaultConsumerHistory);
  },
);

When(
  "aplico los filtros para ver órdenes de trabajo con estado completada",
  async function (this: CustomWorld) {
    const targetUrl = new URL(ROUTES.consumerDetail(301), this.appUrl).href;
    if (this.page.url() !== targetUrl) {
      await this.page.goto(targetUrl);
    }
    const typeSelect = this.page.getByRole("combobox", { name: "Tipo de interacción" });
    await typeSelect.waitFor({ state: "visible" });
    await typeSelect.selectOption({ label: "Órdenes de trabajo" });

    const statusSelect = this.page.getByRole("combobox", { name: "Estado" });
    await statusSelect.waitFor({ state: "visible" });
    await statusSelect.selectOption({ label: "Completada" });
  },
);

Then(
  "el historial muestra exclusivamente las órdenes finalizadas del consumidor",
  async function (this: CustomWorld) {
    const list = this.page.getByTestId("consumer-history-list");
    await list.waitFor({ state: "visible" });
    await this.page.waitForFunction(() => {
      const rows = document.querySelectorAll('[data-testid="consumer-history-list"] tbody tr');
      return rows.length === 1 && rows[0].textContent?.includes("Juan Gómez");
    });

    const text = await list.innerText();
    const rows = list.locator("tbody tr");
    assert.equal(await rows.count(), 1, "Debe mostrar solo la orden completada");
    assert.ok(text.includes("Juan Gómez"), "Debe mostrar al prestador Juan Gómez");
    assert.ok(!text.includes("Pedro Gasista"), "No debe mostrar a Pedro Gasista");
    assert.ok(!text.includes("Ana Electricista"), "No debe mostrar a Ana Electricista");
  },
);

Given(
  "que el consumidor registrado aún no ha emitido solicitudes ni contrataciones",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/consumers/301/history?limit=20", emptyConsumer);
  },
);

When(
  "consulto el historial de actividad en su ficha",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
  },
);

Then(
  "se presenta un mensaje informativo indicando que el consumidor no registra contrataciones previas",
  async function (this: CustomWorld) {
    const emptyStatus = this.page.getByRole("status").filter({
      hasText: "El consumidor no registra contrataciones previas",
    });
    await emptyStatus.waitFor({ state: "visible" });
    const text = await emptyStatus.innerText();
    assert.ok(
      text.includes("El consumidor no registra contrataciones previas"),
      "Debe mostrar el mensaje indicando que no registra contrataciones previas",
    );
  },
);

Given(
  "que la consulta de los datos del consumidor toma unos momentos",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/consumers/301/history?limit=20",
      status: 200,
      body: defaultConsumerHistory,
      delayMs: 3000,
    });
  },
);

When("accedo a la ficha del consumidor", async function (this: CustomWorld) {
  await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
});

Given(
  "que intento consultar un consumidor que no se encuentra registrado",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/consumers/999/history?limit=20", { error: "Not Found" }, 404);
  },
);

When(
  "accedo al enlace de la ficha del consumidor",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.consumerDetail(999), this.appUrl).href);
  },
);

Then(
  "se presenta un mensaje claro indicando que el consumidor no fue encontrado",
  async function (this: CustomWorld) {
    const alert = this.page.getByRole("alert").filter({
      hasText: /no fue encontrado|no encontrado/i,
    });
    await alert.waitFor({ state: "visible" });

    const backLink = alert.locator(`a[href="${ROUTES.users}"]`);
    assert.equal(await backLink.count(), 1, "Debe contener un enlace para volver a usuarios");
  },
);

Given(
  "que mi cuenta de usuario no posee permisos para consultar el detalle de consumidores",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/consumers/301/history?limit=20", { error: "Forbidden" }, 403);
  },
);

When(
  "intento ingresar a la ficha del consumidor",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
  },
);

When(
  "intento consultar la ficha del consumidor",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
  },
);

