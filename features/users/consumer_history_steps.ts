import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";

export const defaultConsumerHistory = {
  id: 301,
  name: "Carlos",
  surname: "López",
  email: "carlos@example.com",
  phone: "+54 11 4444-2222",
  profile_photo_url: "https://storage.loresuelvo.internal/profiles/301.jpg",
  registered_at: "2026-09-01T10:00:00-03:00",
  current_address: "Av. Rivadavia 4500",
  coverage_zone: {
    id: 6,
    name: "Comuna 6",
  },
  history: [
    {
      resource_id: 105,
      operation_id: 105,
      resource_type: "work_order",
      category_name: "Plomería",
      provider: {
        id: 201,
        name: "Juan Gómez",
        profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
      },
      status: "completed",
      total_amount_cents: 2000000,
      created_at: "2026-09-20T10:00:00-03:00",
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    total_pages: 1,
  },
};

Given("que existe un consumidor registrado en el marketplace", async function (this: CustomWorld) {
  await this.stubGet("/admin/consumers/301/history", defaultConsumerHistory);
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
    assert.ok(text.includes("+54 11 4444-2222"), "Debe mostrar el teléfono");
    assert.ok(text.includes("Av. Rivadavia 4500"), "Debe mostrar la dirección habitual");
    assert.ok(text.includes("Comuna 6"), "Debe mostrar la zona de cobertura");
    assert.ok(text.includes("01/09/2026"), "Debe mostrar la fecha de registro formateada");
  },
);

Given(
  "que el consumidor registra actividad de contrataciones en la plataforma",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/consumers/301/history", defaultConsumerHistory);
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
    assert.ok(text.includes("Plomería"), "Debe mostrar el rubro asignado");
    assert.ok(text.includes("Juan Gómez"), "Debe mostrar el nombre del prestador");
    assert.ok(text.toLowerCase().includes("completad"), "Debe mostrar el estado");

    const detailLink = list.locator(`a[href="${ROUTES.operationDetail(105)}"]`);
    assert.equal(await detailLink.count(), 1, "Debe tener un enlace al detalle operativo en /operaciones/105");
  },
);

Given(
  "que el consumidor posee múltiples interacciones registradas",
  async function (this: CustomWorld) {
    const multipleInteractionsConsumer = {
      ...defaultConsumerHistory,
      history: [
        {
          resource_id: 105,
          operation_id: 105,
          resource_type: "work_order",
          category_name: "Plomería",
          status: "completed",
          total_amount_cents: 2000000,
          provider: {
            id: 201,
            name: "Juan Gómez",
            profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
          },
          created_at: "2026-09-20T10:00:00-03:00",
        },
        {
          resource_id: 106,
          operation_id: 106,
          resource_type: "job_request",
          category_name: "Gas",
          status: "pending",
          total_amount_cents: 1500000,
          provider: {
            id: 202,
            name: "Pedro Gasista",
            profile_photo_url: "https://storage.loresuelvo.internal/profiles/202.jpg",
          },
          created_at: "2026-09-21T10:00:00-03:00",
        },
        {
          resource_id: 107,
          operation_id: 107,
          resource_type: "service_proposal",
          category_name: "Electricidad",
          status: "in_progress",
          total_amount_cents: 3000000,
          provider: {
            id: 203,
            name: "Ana Electricista",
            profile_photo_url: "https://storage.loresuelvo.internal/profiles/203.jpg",
          },
          created_at: "2026-09-22T10:00:00-03:00",
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 3,
        total_pages: 1,
      },
    };
    await this.stubGet("/admin/consumers/301/history", multipleInteractionsConsumer);
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

    const text = await list.innerText();
    assert.ok(text.includes("Plomería"), "Debe mostrar la orden de Plomería");
    assert.ok(text.includes("Juan Gómez"), "Debe mostrar al prestador Juan Gómez");
    assert.ok(!text.includes("Gas"), "No debe mostrar Gas");
    assert.ok(!text.includes("Pedro Gasista"), "No debe mostrar a Pedro Gasista");
    assert.ok(!text.includes("Electricidad"), "No debe mostrar Electricidad");
    assert.ok(!text.includes("Ana Electricista"), "No debe mostrar a Ana Electricista");
  },
);

Given(
  "que el consumidor registrado aún no ha emitido solicitudes ni contrataciones",
  async function (this: CustomWorld) {
    const emptyConsumer = {
      ...defaultConsumerHistory,
      history: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      },
    };
    await this.stubGet("/admin/consumers/301/history", emptyConsumer);
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
      endpoint: "/admin/consumers/301/history",
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
    await this.stubGet("/admin/consumers/999/history", { error: "Not Found" }, 404);
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
    await this.stubGet("/admin/consumers/301/history", { error: "Forbidden" }, 403);
  },
);

When(
  "intento ingresar a la ficha del consumidor",
  async function (this: CustomWorld) {
    await this.page.goto(new URL(ROUTES.consumerDetail(301), this.appUrl).href);
  },
);

