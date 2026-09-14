# US-3.2 — Login de administrador

Estado: aprobado funcionalmente por el usuario. Los escenarios ejecutables
viven en `features/auth/login.feature` y su contenido aprobado es inmutable.

Referencia: [issue #4](https://github.com/LoResuelvo/loresuelvo-admin-webapp/issues/4).
Arquitectura acordada: RWA con Next.js y autenticación de servidor, siguiendo
el patrón de clientes. Los siguientes escenarios describen comportamiento,
no el mecanismo de autenticación.

## Escenarios de aceptación

```gherkin
Feature: Iniciar sesión como administrador
  Como administrador
  Quiero iniciar sesión en Lo Resuelvo
  Para acceder al área de administración

  Scenario: 01-ADM Mostrar la entrada de administración
    Given que no tengo una sesión activa
    When entro a la página de inicio
    Then veo la identidad de Lo Resuelvo y el botón "Iniciar sesión"
    And no veo un formulario de contraseña ni una opción de registro

  Scenario: 02-ADM Redirección al portal de autenticación
    Given que estoy en la página de inicio
    When hago clic en el botón "Iniciar sesión"
    Then soy redirigido al portal de autenticación de Auth0
    And no puedo iniciar otra solicitud mientras se procesa la redirección

  Scenario Outline: 03-ADM Esperar la verificación de acceso
    Given que todavía se está verificando <verificacion>
    When entro al área de administración
    Then veo un mensaje que indica que se está verificando mi acceso
    And no veo contenido administrativo
    Examples:
      | verificacion |
      | mi sesión    |
      | mi perfil    |

  Scenario: 04-ADM Inicio de sesión exitoso como administrador
    Given que inicié sesión exitosamente en Auth0
    And tengo una cuenta de administrador habilitada con nombre "Ana", apellido "Pérez" y correo "ana@example.com"
    When entro al área de administración
    Then veo mi nombre "Ana", apellido "Pérez" y correo "ana@example.com"
    And puedo acceder al área de administración

  Scenario: 05-ADM Acceso directo sin sesión activa
    Given que no tengo una sesión activa
    When entro directamente al área de administración
    Then se me ofrece iniciar sesión
    And no veo contenido administrativo
    And no soy redirigido repetidamente

  Scenario: 06-ADM Conservar el acceso al recargar
    Given que tengo una sesión activa
    And tengo una cuenta de administrador habilitada en Lo Resuelvo
    And estoy en el área de administración
    When recargo la página
    Then vuelvo a acceder al área de administración con mi identidad verificada

  Scenario: 07-ADM Solicitar una nueva autenticación
    Given que mi autenticación dejó de ser válida
    When entro al área de administración
    Then veo un mensaje que indica que debo iniciar sesión nuevamente
    And no veo contenido administrativo
    And no soy redirigido repetidamente

  Scenario: 08-ADM Acceso con una cuenta sin habilitación en la plataforma
    Given que inicié sesión exitosamente en Auth0
    And mi cuenta no está habilitada en Lo Resuelvo
    When entro al área de administración
    Then veo un mensaje que indica que mi cuenta no está habilitada y que debo contactar al responsable del entorno
    And no veo contenido administrativo ni una opción de registro

  Scenario Outline: 09-ADM Restringir el acceso a cuentas no administrativas
    Given que inicié sesión exitosamente en Auth0
    And mi cuenta de Lo Resuelvo es de <tipo>
    When entro al área de administración
    Then veo un mensaje que indica que el acceso está reservado a administradores
    And no veo contenido administrativo
    Examples:
      | tipo      |
      | cliente   |
      | prestador |

  Scenario: 10-ADM No se puede verificar el acceso temporalmente
    Given que inicié sesión exitosamente en Auth0
    And el servicio de consulta de mi perfil no está disponible
    When entro al área de administración
    Then veo un mensaje que informa que no se pudo verificar mi acceso
    And veo la opción "Reintentar"
    And no se informa que mi cuenta no está habilitada
    And no veo contenido administrativo

  Scenario: 11-ADM Reintentar la verificación de acceso
    Given que veo un error temporal al verificar mi acceso
    And el servicio de consulta de mi perfil vuelve a estar disponible
    And tengo una cuenta de administrador habilitada en Lo Resuelvo
    When hago clic en "Reintentar"
    Then accedo al área de administración con mi identidad verificada

  Scenario Outline: 12-ADM Volver después de una autenticación incompleta
    Given que <resultado>
    When vuelvo a la aplicación
    Then no veo contenido administrativo
    And veo un mensaje que indica que no se completó el inicio de sesión
    And se me ofrece iniciar sesión nuevamente
    Examples:
      | resultado                                      |
      | cancelé el inicio de sesión                     |
      | ocurrió un error durante el inicio de sesión    |
      | no completé la verificación en dos pasos        |

  Scenario: 13-ADM Acceder mediante teclado
    Given que estoy en la página de inicio
    And llegué al botón "Iniciar sesión" usando el teclado
    And puedo distinguir visualmente el botón enfocado
    When activo el botón con el teclado
    Then soy redirigido al portal de autenticación de Auth0
```

## Cobertura técnica complementaria

Los escenarios no sustituyen las pruebas de contratos, seguridad e integración.
Cada variante de esta tabla requiere evidencia determinista propia, aunque
comparta un resultado funcional con otras variantes.

| Escenario | Casos técnicos |
| --- | --- |
| 02, 12 | Rutas de login y callback del SDK; cancelación, error y retorno incompleto. No implementar OAuth ni MFA propios. |
| 03, 05, 06 | Resolución de sesión y perfil antes de renderizar datos protegidos; protección de entradas server-side; sesión no recuperable; ausencia de bucles. |
| 04 | `GET /me` con access token vigente obtenido en servidor para la audiencia API; nunca ID token. Mapper de `name`, `surname`, `role`, perfil sin `address` ni `category`, foto opcional. |
| 07 | Sesión inválida o `401` de `/me`, sin reintentos infinitos. |
| 08 | `404` de `/me`, sin crear ni modificar perfiles, sin onboarding. |
| 09 | `200` con `consumer` o `provider`; nunca asumir `403` de `/me`. |
| 10, 11 | Error de red, `5xx`, JSON inválido o contrato incompatible; recuperación explícita y acceso bloqueado ante cada variante. |
| Transversal | Tokens y secretos solo servidor; `enableAccessTokenEndpoint: false`; sin exposición en props, respuestas o logs; sin caché compartida de perfiles ni contaminación entre sesiones; dobles inaccesibles en producción. |
| UI | Responsive mobile/tablet/desktop, contraste, foco, estados anunciados y reducción de movimiento. |

## Validación real local

La configuración administrativa de Auth0 corresponde al usuario. Verificar
login real con MFA, consulta server-side a `/me` y entrada Admin con evidencia
sanitizada. Los dobles de Auth0/API no acreditan MFA real. Si la autenticación
queda abandonada en el portal sin retorno, la web no puede detectar ese hecho;
se verifica que el acceso siga cerrado y que volver al inicio permita reintentar.
El escenario 12 cubre el retorno comunicado como incompleto.

Probar el `404` real con una identidad de prueba sin perfil, sin modificar la
semilla administradora. No registrar tokens, credenciales, correo real,
identificadores reales ni códigos MFA. No modificar tenant, API Go ni Docker.

## Siguiente frontera

Los escenarios aprobados se trasladaron a `features/auth/login.feature` con
`@wip`, reemplazando los dos escenarios heredados. Cada tag se retirará en el
commit funcional que cierre su escenario en GREEN.
Continuar con conducción `AGENT_ORCHESTRATED`, batches `SCENARIO`, presentación
aislada antes de integrar y cierre GREEN de cada escenario antes del siguiente.
