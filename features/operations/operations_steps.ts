import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import { anAdminProfile, stubAdminAccess } from "../support/admin-access";

Given("que he iniciado sesión en el panel de administración", async function (this: CustomWorld) {
  await this.context.clearCookies();
  await stubAdminAccess(this, anAdminProfile());
});

const sampleOperations = [
  {
    id: "op-1",
    job_request_id: 101,
    service_proposal_id: 201,
    work_order_id: 301,
    consumer: {
      id: 1,
      name: "Juan",
      surname: "Pérez",
      email: "juan.perez@example.com",
    },
    provider: {
      id: 2,
      name: "Carlos",
      surname: "López",
      email: "carlos.lopez@example.com",
    },
    category: {
      id: 1,
      name: "Plomería",
    },
    status: "in_progress",
    bottleneck: "stalled",
    next_action_by: "provider",
    created_at: "2026-09-18T10:00:00Z",
    updated_at: "2026-09-20T14:30:00Z",
  },
  {
    id: "op-2",
    job_request_id: 102,
    service_proposal_id: 202,
    consumer: {
      id: 3,
      name: "María",
      surname: "Gómez",
      email: "maria.gomez@example.com",
    },
    provider: {
      id: 4,
      name: "Roberto",
      surname: "Díaz",
      email: "roberto.diaz@example.com",
    },
    category: {
      id: 2,
      name: "Electricidad",
    },
    status: "quoted",
    bottleneck: "pending_proposal_24h",
    next_action_by: "consumer",
    created_at: "2026-09-21T09:00:00Z",
    updated_at: "2026-09-22T11:00:00Z",
  },
  {
    id: "op-3",
    job_request_id: 103,
    consumer: {
      id: 5,
      name: "Lucía",
      surname: "Fernández",
      email: "lucia.fernandez@example.com",
    },
    provider: {
      id: 6,
      name: "Martín",
      surname: "Silva",
      email: "martin.silva@example.com",
    },
    category: {
      id: 3,
      name: "Gas",
    },
    status: "requested",
    bottleneck: "none",
    next_action_by: "none",
    created_at: "2026-09-23T08:00:00Z",
    updated_at: "2026-09-23T08:00:00Z",
  },
];

Given(
  "que existen contrataciones en curso con diferentes estados en el marketplace",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/operations", sampleOperations);
    await this.stubGet("/operations", sampleOperations);
  },
);

When("ingreso a la sección de operaciones", async function (this: CustomWorld) {
  const operationsRoute = (ROUTES as { operations?: string }).operations || "/operaciones";
  await this.page.goto(new URL(operationsRoute, this.appUrl).href);
});

Then(
  "visualizo el listado de contrataciones con el cliente, prestador, rubro, estado actual, la alerta operativa detectada y el responsable de avanzar el servicio",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 3);

    const row0Text = await rows.nth(0).innerText();
    assert.ok(row0Text.includes("Juan") && row0Text.includes("Pérez"));
    assert.ok(row0Text.includes("Carlos") && row0Text.includes("López"));
    assert.ok(row0Text.includes("Plomería"));
    assert.ok(row0Text.includes("En progreso") || row0Text.includes("En curso"));
    assert.ok(row0Text.includes("Estancada") || row0Text.includes("Sin avance"));
    assert.ok(row0Text.includes("Prestador"));

    const row1Text = await rows.nth(1).innerText();
    assert.ok(row1Text.includes("María") && row1Text.includes("Gómez"));
    assert.ok(row1Text.includes("Roberto") && row1Text.includes("Díaz"));
    assert.ok(row1Text.includes("Electricidad"));
    assert.ok(row1Text.includes("Cotizado") || row1Text.includes("Cotizada"));
    assert.ok(row1Text.includes("Propuesta") || row1Text.includes("24h"));
    assert.ok(row1Text.includes("Cliente"));
  },
);

Given("que la carga de las operaciones toma unos momentos", async function (this: CustomWorld) {
  await this.addApiStub({
    method: "GET",
    endpoint: "/admin/operations",
    status: 200,
    body: [],
    delayMs: 3000,
  });
  await this.addApiStub({
    method: "GET",
    endpoint: "/operations",
    status: 200,
    body: [],
    delayMs: 3000,
  });
});

Then(
  "se presenta una vista de carga con indicadores visuales mientras se obtiene la información",
  async function (this: CustomWorld) {
    const skeleton = this.page.getByTestId("operations-skeleton");
    await skeleton.waitFor({ state: "visible" });
    const shimmerRows = skeleton.locator("[data-testid='skeleton-row']");
    assert.ok((await shimmerRows.count()) >= 1);
  },
);

Given(
  "que no existen contrataciones que coincidan con el criterio seleccionado",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/operations", []);
    await this.stubGet("/operations", []);
  },
);

When("aplico el filtro en la bandeja de operaciones", async function (this: CustomWorld) {
  const operationsRoute = (ROUTES as { operations?: string }).operations || "/operaciones";
  if (!this.page.url().includes(operationsRoute)) {
    await this.page.goto(new URL(operationsRoute, this.appUrl).href);
  }
});

Then(
  "se presenta un mensaje indicando que no se encontraron operaciones disponibles",
  async function (this: CustomWorld) {
    const emptyState = this.page.getByTestId("operations-empty-state");
    await emptyState.waitFor({ state: "visible" });
    assert.ok((await emptyState.innerText()).includes("No se encontraron operaciones disponibles"));
  },
);

Given(
  "que existen contrataciones con solicitudes demoradas por más de 24 horas y otras al día",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/operations", sampleOperations);
    await this.stubGet("/operations", sampleOperations);
  },
);

When(
  "filtro las operaciones seleccionando la alerta {string}",
  async function (this: CustomWorld, alertLabel: string) {
    const operationsRoute = (ROUTES as { operations?: string }).operations || "/operaciones";
    if (!this.page.url().includes(operationsRoute)) {
      await this.page.goto(new URL(operationsRoute, this.appUrl).href);
    }
    const alertSelect = this.page.getByRole("combobox", { name: /alerta/i });
    await alertSelect.waitFor({ state: "visible" });
    await alertSelect.selectOption({ label: alertLabel });
  },
);

Then(
  "se presentan únicamente los trabajos que requieren atención por llevar más de un día sin avance",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 1);

    const row0Text = await rows.nth(0).innerText();
    assert.ok(row0Text.includes("Juan") && row0Text.includes("Pérez"));
    assert.ok(row0Text.includes("Estancada") || row0Text.includes("Sin avance"));
  },
);

Given(
  "que existen contrataciones en diversos rubros y con distintos clientes",
  async function (this: CustomWorld) {
    const diverseOperations = [
      ...sampleOperations,
      {
        id: "op-4",
        job_request_id: 104,
        consumer: {
          id: 7,
          name: "Gonzalo",
          surname: "Pérez",
          email: "gonzalo.perez@example.com",
        },
        provider: {
          id: 8,
          name: "Esteban",
          surname: "Quito",
          email: "esteban.quito@example.com",
        },
        category: {
          id: 2,
          name: "Electricidad",
        },
        status: "requested",
        bottleneck: "none",
        next_action_by: "none",
        created_at: "2026-09-23T08:00:00Z",
        updated_at: "2026-09-23T08:00:00Z",
      },
    ];

    await this.stubGet("/categories", [
      { id: 1, name: "Plomería" },
      { id: 2, name: "Electricidad" },
      { id: 3, name: "Gas" },
    ]);
    await this.stubGet("/admin/operations", diverseOperations);
    await this.stubGet("/operations", diverseOperations);
  },
);

When(
  "busco por el apellido {string} y selecciono el rubro {string}",
  async function (this: CustomWorld, apellido: string, rubro: string) {
    const operationsRoute = (ROUTES as { operations?: string }).operations || "/operaciones";
    if (!this.page.url().includes(operationsRoute)) {
      await this.page.goto(new URL(operationsRoute, this.appUrl).href);
    }

    const searchInput = this.page.getByRole("searchbox").or(this.page.getByLabel(/buscar/i));
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill(apellido);

    const categorySelect = this.page.getByRole("combobox", { name: /rubro/i });
    await categorySelect.waitFor({ state: "visible" });
    await categorySelect.selectOption({ label: rubro });
  },
);

Then(
  "el listado muestra exclusivamente los servicios que coinciden con el rubro y el participante buscado",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
    await this.page.waitForFunction(
      () => document.querySelectorAll("tbody tr").length === 1,
      null,
      { timeout: 5000 },
    );
    const rows = this.page.locator("tbody tr");
    assert.equal(await rows.count(), 1);

    const row0Text = await rows.nth(0).innerText();
    assert.ok(row0Text.includes("Pérez"));
    assert.ok(row0Text.includes("Plomería"));
  },
);

Given(
  "que mi cuenta de usuario no posee permisos para gestionar operaciones",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/operations",
      status: 403,
      body: { error: "Forbidden" },
    });
    await this.addApiStub({
      method: "GET",
      endpoint: "/operations",
      status: 403,
      body: { error: "Forbidden" },
    });
  },
);

When(
  "intento ingresar a la sección de operaciones",
  async function (this: CustomWorld) {
    const operationsRoute = (ROUTES as { operations?: string }).operations || "/operaciones";
    await this.page.goto(new URL(operationsRoute, this.appUrl).href);
  },
);

Then(
  "el sistema me informa que el acceso está restringido",
  async function (this: CustomWorld) {
    const alert = this.page.getByRole("alert").filter({
      hasText: /restringido|permisos/i,
    });
    await alert.waitFor({ state: "visible" });
    assert.ok(await alert.isVisible());
    const retryButton = this.page.getByRole("button", { name: /reintentar/i });
    assert.equal(await retryButton.count(), 0);
  },
);

Given(
  "que el sistema experimenta dificultades de conexión con el servidor",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/operations",
      status: 500,
      body: { error: "Internal Server Error" },
    });
    await this.addApiStub({
      method: "GET",
      endpoint: "/operations",
      status: 500,
      body: { error: "Internal Server Error" },
    });
  },
);

When(
  "intento consultar la sección de operaciones",
  async function (this: CustomWorld) {
    const operationsRoute = (ROUTES as { operations?: string }).operations || "/operaciones";
    await this.page.goto(new URL(operationsRoute, this.appUrl).href);
  },
);

Then(
  "se presenta un aviso informando el inconveniente con la posibilidad de reintentar la carga",
  async function (this: CustomWorld) {
    const errorAlert = this.page.getByRole("alert").filter({
      hasText: /error|inconveniente|problema/i,
    });
    await errorAlert.waitFor({ state: "visible" });
    const retryButton = this.page.getByRole("button", { name: /reintentar/i });
    await retryButton.waitFor({ state: "visible" });
    assert.ok(await retryButton.isVisible());
  },
);

Given(
  "que visualizo una contratación en la bandeja de operaciones",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/operations", sampleOperations);
    await this.stubGet("/operations", sampleOperations);
    const operationsRoute = (ROUTES as { operations?: string }).operations || "/operaciones";
    await this.page.goto(new URL(operationsRoute, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor({ state: "visible" });
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor({ state: "visible" });
  },
);

When(
  "selecciono la contratación para inspeccionarla",
  async function (this: CustomWorld) {
    const firstRow = this.page.locator("tbody tr").first();
    await firstRow.click();
  },
);

Then(
  "accedo a la ficha con el detalle completo del servicio",
  async function (this: CustomWorld) {
    await this.page.waitForURL(/\/operaciones\/.+/);
    const heading = this.page.getByRole("heading", {
      name: /ficha|detalle/i,
    });
    await heading.waitFor({ state: "visible" });
    assert.ok(await heading.isVisible());
  },
);

const sampleOperationDetail = {
  id: "op-101",
  status: "in_progress",
  created_at: "2026-09-18T10:00:00Z",
  category: {
    id: 1,
    name: "Plomería",
  },
  consumer: {
    id: 10,
    name: "Ana",
    surname: "Martínez",
    email: "ana.martinez@example.com",
    profile_photo_url: null,
  },
  provider: {
    id: 20,
    name: "Carlos",
    surname: "López",
    email: "carlos.lopez@example.com",
    profile_photo_url: null,
  },
  current_address: "Av. Corrientes 1234, CABA",
  request: {
    id: 501,
    title: "Reparación de cañería en cocina",
    description: "Pérdida continua de agua bajo la bacha de la cocina.",
    status: "in_progress",
    source_assessment_id: "asm-77",
    diagnostic_summary: "Posible fisura en sifón de desagüe con goteo constante.",
    photos: ["https://example.com/photos/leak-1.jpg", "https://example.com/photos/leak-2.jpg"],
  },
  timeline: [
    {
      type: "job_requested",
      title: "Solicitud creada",
      timestamp: "2026-09-18T10:00:00Z",
    },
    {
      type: "proposal_sent",
      title: "Presupuesto enviado",
      timestamp: "2026-09-19T11:30:00Z",
    },
    {
      type: "order_created",
      title: "Orden de trabajo confirmada",
      timestamp: "2026-09-20T14:00:00Z",
    },
  ],
};

Given(
  "que existe una contratación registrada entre un cliente y un prestador",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/operations/op-101", sampleOperationDetail);
    await this.stubGet("/operations/op-101", sampleOperationDetail);
  },
);

When("consulto la ficha de la contratación", async function (this: CustomWorld) {
  const detailRoute = ROUTES.operationDetail("op-101");
  await this.page.goto(new URL(detailRoute, this.appUrl).href);
});

Then(
  "visualizo los datos de contacto del cliente, los del prestador, el rubro y el domicilio registrado",
  async function (this: CustomWorld) {
    const header = this.page.getByTestId("operation-header");
    await header.waitFor({ state: "visible", timeout: 5000 });
    const headerText = await header.innerText();
    assert.ok(headerText.includes("Ana") && headerText.includes("Martínez"));
    assert.ok(headerText.includes("ana.martinez@example.com"));
    assert.ok(headerText.includes("Carlos") && headerText.includes("López"));
    assert.ok(headerText.includes("carlos.lopez@example.com"));
    assert.ok(headerText.includes("Plomería"));
    assert.ok(headerText.includes("Av. Corrientes 1234, CABA"));
  },
);

Given(
  "que la contratación ha transitado desde la solicitud inicial hasta la orden de trabajo",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/operations/op-101", sampleOperationDetail);
    await this.stubGet("/operations/op-101", sampleOperationDetail);
  },
);

Then(
  "visualizo una línea de tiempo cronológica con cada evento ocurrido, la fecha y hora registrada y su avance",
  async function (this: CustomWorld) {
    const timeline = this.page.getByTestId("operation-timeline");
    await timeline.waitFor({ state: "visible", timeout: 5000 });

    const milestones = timeline.locator("[data-testid='timeline-milestone']");
    assert.equal(await milestones.count(), 3);

    const firstMilestone = await milestones.nth(0).innerText();
    assert.ok(firstMilestone.includes("Solicitud creada"));

    const secondMilestone = await milestones.nth(1).innerText();
    assert.ok(secondMilestone.includes("Presupuesto enviado"));

    const thirdMilestone = await milestones.nth(2).innerText();
    assert.ok(thirdMilestone.includes("Orden de trabajo confirmada"));

    assert.ok(firstMilestone.includes("18") || firstMilestone.includes("2026"));
    assert.ok(secondMilestone.includes("19") || secondMilestone.includes("2026"));
    assert.ok(thirdMilestone.includes("20") || thirdMilestone.includes("2026"));

    const progressIndicators = timeline.locator("[data-testid='milestone-step']");
    assert.equal(await progressIndicators.count(), 3);
  },
);

Given(
  "que la solicitud del cliente fue generada mediante el asistente de diagnóstico virtual",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/operations/op-101", sampleOperationDetail);
    await this.stubGet("/operations/op-101", sampleOperationDetail);
  },
);

When(
  "reviso la sección de solicitud en la ficha",
  async function (this: CustomWorld) {
    const detailRoute = ROUTES.operationDetail("op-101");
    if (!this.page.url().includes(detailRoute)) {
      await this.page.goto(new URL(detailRoute, this.appUrl).href);
    }
    const requestSection = this.page.getByTestId("operation-request-card");
    await requestSection.waitFor({ state: "visible", timeout: 5000 });
  },
);

Then(
  "visualizo el diagnóstico del problema sugerido por el asistente, la descripción y las fotos adjuntas",
  async function (this: CustomWorld) {
    const requestSection = this.page.getByTestId("operation-request-card");
    await requestSection.waitFor({ state: "visible", timeout: 5000 });
    const text = await requestSection.innerText();

    assert.ok(
      text.includes("Posible fisura en sifón de desagüe") || text.includes("goteo constante"),
    );
    assert.ok(
      text.includes("Pérdida continua de agua bajo la bacha de la cocina."),
    );

    const photos = requestSection
      .locator("[data-testid='request-photo']")
      .or(requestSection.locator("img"));
    assert.ok((await photos.count()) >= 2);
  },
);



