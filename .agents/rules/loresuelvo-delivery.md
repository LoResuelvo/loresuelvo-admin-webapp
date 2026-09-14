---
trigger: always_on
description: Always-on delivery workflow rules for LoResuelvo
---

# Lo Resuelvo Delivery Workflow (Always On)

Reglas obligatorias para todos los agentes que operen en este workspace:

1. **Gobernanza del proyecto**: Leer y respetar `AGENTS.md`, las skills aplicables (`frontend-ai-development-workflow`, `frontend-testing-gates`, `frontend-commit-governance`, `frontend-us-delivery`, `frontend-bdd-tdd-process`, etc.) y las preferencias del clon en `.agents/local/README.md` cuando exista.
2. **TDD focalizado con `delivery_test`**: Para el ciclo interactivo RED/GREEN, la herramienta canónica obligatoria es MCP `delivery_test` (soporta modos `affected`, `unit`, `scenario`, `diagnostic`). No ejecutar comandos crudos de shell ni suites pesadas de gates como bucle rápido de TDD. La evidencia de TDD se conserva en `.delivery/runtime/tdd/` y no es consumible por git hooks.
3. **Selección automática de gates por impacto**: No elegir manualmente el gate ni encadenar comandos de validación. `delivery_prepare` opera únicamente sobre el snapshot staged en fronteras atómicas e inspecciona determinísticamente el impacto real (análisis AST de dependencias TypeScript e indexación de steps Cucumber) definido en `.delivery/policy.v1.json`.
4. **Frontera atómica**: En cada frontera atómica, realizar stage exacto de los cambios e invocar MCP `delivery_prepare` con el `intent` correspondiente (`prepare_commit`, `close_scenario`, `close_batch`, `close_us`, `repair_ci`) y el mensaje de commit propuesto.
5. **Receipt aprobado obligatorio y soporte de jobs**: Solo proceder a ejecutar `git commit` si `delivery_prepare` devuelve `status: passed`. Ante gates extensos (Gate D o Gate R), `delivery_prepare` opera en modo job devolviendo un `jobId` que se aguarda de forma no bloqueante con `delivery_job_wait`. Indisponibilidad o timeout exige recuperación con `delivery_job_wait` o escalación; nunca bypass con CLI.
6. **Reparación ante CI fallido (Gate R)**: Ante un fallo en CI remoto, queda estrictamente prohibido cualquier bypass ambiental (`DELIVERY_SKIP_CI_CHECK` es rechazado fail-closed con `DEPRECATED_CI_BYPASS_REJECTED`). El agente debe invocar `delivery_prepare` con `intent: "repair_ci"` y `repairsSha: "<failed-sha>"`, ejecutando el Gate R (reproducción exhaustiva local de los checks de CI asignados a agentes: delivery_unit, lint, typechecks, unit, e2e_full y build; excluyendo Docker build). Dicho receipt genera una autorización de un solo uso en `pre-push` para subsanar el fallo.
7. **Verificación sobre HEAD para cierre**: Al cerrar una User Story o batch cuando HEAD ya contiene el código definitivo y no restan tags `@wip`, invocar `delivery_verify_head({ intent: "close_us", scopeFiles: [...] })` para certificar Gate D y registrar evidencia en el ledger sin crear commits artificiales ni vacíos.
8. **Diagnóstico compacto y CLI**: El MCP devuelve diagnósticos procesados y compactos indicando el `logPath` persistente. Comandos directos o la CLI (`npm run delivery:*`) quedan reservados exclusivamente para desarrolladores humanos, diagnóstico focalizado puntual o fallback expresamente autorizado.
9. **Prohibido el bypass**: No usar `--no-verify` en `git commit` ni en `git push`.
10. **Hooks inalterables**: No desactivar, eludir ni desinstalar los Git hooks ni los guards anticipatorios del entorno.
11. **Detención por indisponibilidad**: Si el servidor MCP `loresuelvo-delivery` requerido no está disponible o no responde, detenerse y notificar al usuario. No recurrir a la CLI de forma autónoma.
12. **Propagación a subagentes**: Todo subagente developer creado para tareas de implementación debe recibir acceso completo al MCP configurando `enable_mcp_tools: true` (`delivery_test`, `delivery_prepare`, `delivery_job_wait`).
13. **Superficie Docker y pipeline humano (HUMAN_ONLY)**: Modificaciones a `Dockerfile`, `.dockerignore`, `compose*.yml`, cualquier archivo bajo `.github/workflows/**` o scripts de construcción de imágenes pertenecen exclusivamente a desarrolladores humanos. Los agentes se detienen con `HUMAN_ONLY_CHANGE` o `HUMAN_ONLY_CI_FAILURE` y escalan a `STOP_USER`.
14. **Ventana continua de CI sin polling**: Se permiten hasta cuatro commits pendientes en vuelo (`queued`, `in_progress`, `not_found`). La ventana y los incidentes activos se evalúan automáticamente en `delivery_prepare` y `pre-push`; no se requiere polling ni monitoreo periódico por SHA por parte del developer. Los incidentes fallidos bloquean nuevos pushes ordinarios hasta que se resuelvan con `repair_ci`.
