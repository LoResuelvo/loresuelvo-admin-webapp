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
