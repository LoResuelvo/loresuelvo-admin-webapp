import assert from "node:assert/strict";
import { Given, When, Then } from "@cucumber/cucumber";
import { ROUTES } from "@/lib/routes";
import { CustomWorld } from "../support/world";
import { multiMonthAuditLogsResponse, sampleAuditLogsResponse } from "./audit_fixtures";

Given(
  "que existen intervenciones administrativas registradas en la plataforma",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/audit-logs", sampleAuditLogsResponse);
  },
);

When("accedo a la sección de auditoría", async function (this: CustomWorld) {
  const auditPath = (ROUTES as unknown as Record<string, string>).audit ?? "/auditoria";
  await this.page.goto(new URL(auditPath, this.appUrl).href);
});

Then(
  "visualizo los registros ordenados por fecha con el operador responsable, el recurso involucrado, la acción efectuada y el motivo justificado",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    const row0 = rows.nth(0);
    const text0 = await row0.innerText();
    assert.ok(text0.includes("28/09/2026") || text0.includes("2026-09-28"));
    assert.ok(text0.includes("operador@loresuelvo.com"));
    assert.ok(text0.includes("Contratación #105") || text0.includes("105"));
    assert.ok(text0.includes("Acceso a chat privado"));
    assert.ok(text0.includes("Investigación de reporte"));

    const row1 = rows.nth(1);
    const text1 = await row1.innerText();
    assert.ok(text1.includes("27/09/2026") || text1.includes("2026-09-27"));
    assert.ok(text1.includes("soporte@loresuelvo.com"));
    assert.ok(text1.includes("Reclamo #clm-204") || text1.includes("clm-204"));
    assert.ok(text1.includes("Resolución de reclamo"));
    assert.ok(text1.includes("Resolución de disputa"));
  },
);

Given(
  "que la bitácora registra accesos a chats privados y resoluciones de reclamos",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/audit-logs", sampleAuditLogsResponse);
  },
);

When(
  "filtro los registros por la acción {string}",
  async function (this: CustomWorld, actionLabel: string) {
    const auditPath = (ROUTES as unknown as Record<string, string>).audit ?? "/auditoria";
    if (!this.page.url().includes(auditPath)) {
      await this.page.goto(new URL(auditPath, this.appUrl).href);
    }
    const select = this.page.getByLabel("Filtrar por acción");
    await select.waitFor();
    await select.selectOption({ label: actionLabel });
  },
);

Then(
  "se presentan únicamente las intervenciones vinculadas a la inspección de mensajes",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    await this.page.waitForFunction(
      () => document.querySelectorAll("tbody tr").length === 1,
      null,
      { timeout: 5000 },
    );
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 1);

    const text = await rows.first().innerText();
    assert.ok(text.includes("Acceso a chat privado"));
    assert.ok(text.includes("operador@loresuelvo.com"));
    assert.ok(!text.includes("Resolución de reclamo"));
  },
);

Given(
  "que distintos operadores han registrado intervenciones en la plataforma",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/audit-logs", sampleAuditLogsResponse);
  },
);

When(
  "busco los registros asociados al correo {string}",
  async function (this: CustomWorld, operatorEmail: string) {
    const auditPath = (ROUTES as unknown as Record<string, string>).audit ?? "/auditoria";
    if (!this.page.url().includes(auditPath)) {
      await this.page.goto(new URL(auditPath, this.appUrl).href);
    }
    const searchInput = this.page.getByLabel("Buscar por operador");
    await searchInput.waitFor();
    await searchInput.fill(operatorEmail);
  },
);

Then(
  "el listado expone exclusivamente las intervenciones realizadas por dicho operador",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    await this.page.waitForFunction(
      () => document.querySelectorAll("tbody tr").length === 1,
      null,
      { timeout: 5000 },
    );
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 1);

    const text = await rows.first().innerText();
    assert.ok(text.includes("operador@loresuelvo.com"));
    assert.ok(!text.includes("soporte@loresuelvo.com"));
  },
);

Given(
  "que existen registros de auditoría de varios meses",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/audit-logs", multiMonthAuditLogsResponse);
  },
);

When(
  "selecciono el rango temporal entre {string} y {string}",
  async function (this: CustomWorld, fromDate: string, toDate: string) {
    const auditPath = (ROUTES as unknown as Record<string, string>).audit ?? "/auditoria";
    if (!this.page.url().includes(auditPath)) {
      await this.page.goto(new URL(auditPath, this.appUrl).href);
    }
    const fromInput = this.page.getByLabel("Fecha desde");
    await fromInput.waitFor();
    await fromInput.fill(fromDate);

    const toInput = this.page.getByLabel("Fecha hasta");
    await toInput.waitFor();
    await toInput.fill(toDate);
  },
);

Then(
  "visualizo únicamente las intervenciones comprendidas dentro del período seleccionado",
  async function (this: CustomWorld) {
    const table = this.page.getByRole("table");
    await table.waitFor();
    await this.page.waitForFunction(
      () => document.querySelectorAll("tbody tr").length === 2,
      null,
      { timeout: 5000 },
    );
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
    assert.equal(await rows.count(), 2);

    for (let i = 0; i < 2; i++) {
      const text = await rows.nth(i).innerText();
      assert.ok(!text.includes("15/08/2026") && !text.includes("2026-08"));
      assert.ok(!text.includes("28/09/2026") && !text.includes("2026-09-28"));
    }
    const allText = await table.innerText();
    assert.ok(allText.includes("10/09/2026") || allText.includes("2026-09-10"));
    assert.ok(allText.includes("18/09/2026") || allText.includes("2026-09-18"));
  },
);

Given(
  "que selecciono una intervención de la bitácora de auditoría",
  async function (this: CustomWorld) {
    await this.stubGet("/admin/audit-logs", sampleAuditLogsResponse);
    const auditPath = (ROUTES as unknown as Record<string, string>).audit ?? "/auditoria";
    await this.page.goto(new URL(auditPath, this.appUrl).href);
    const table = this.page.getByRole("table");
    await table.waitFor();
    const rows = this.page.locator("tbody tr");
    await rows.first().waitFor();
  },
);

When(
  "abro la ficha de detalle de la intervención",
  async function (this: CustomWorld) {
    const firstRow = this.page.locator("tbody tr").first();
    await firstRow.waitFor();
    await firstRow.click();
  },
);

Then(
  "visualizo la información contextual de la acción, el origen protegido de la solicitud y su identificador de trazabilidad",
  async function (this: CustomWorld) {
    const modal = this.page.getByRole("dialog");
    await modal.waitFor();
    const modalText = await modal.innerText();

    assert.ok(modalText.includes("operador@loresuelvo.com"));
    assert.ok(modalText.includes("Acceso a chat privado"));
    assert.ok(modalText.includes("Investigación de reporte"));
    assert.ok(modalText.includes("Contratación #105") || modalText.includes("105"));

    assert.ok(modalText.includes("192.168.1.xxx") || modalText.includes("192.168.1.***"));
    assert.ok(!modalText.includes("192.168.1.50"));
    assert.ok(modalText.includes("Mozilla/5.0") || modalText.includes("Admin Console"));

    assert.ok(modalText.includes("aud-001"));
  },
);

Given(
  "que la consulta de intervenciones toma unos momentos",
  async function (this: CustomWorld) {
    await this.addApiStub({
      method: "GET",
      endpoint: "/admin/audit-logs",
      status: 200,
      body: sampleAuditLogsResponse,
      delayMs: 800,
    });
  },
);

Then(
  "se presenta una vista de carga con indicadores visuales mientras se obtienen los datos",
  async function (this: CustomWorld) {
    const skeleton = this.page.locator('[aria-busy="true"]');
    await skeleton.waitFor({ state: "visible", timeout: 2000 });
    const ariaLabel = await skeleton.getAttribute("aria-label");
    assert.ok(ariaLabel && ariaLabel.length > 0);
    const pulseElement = this.page.locator(".animate-pulse").first();
    await pulseElement.waitFor({ state: "visible", timeout: 2000 });
    assert.ok(await pulseElement.isVisible());
  },
);




