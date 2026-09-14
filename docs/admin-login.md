# Login de administración — operación y validación

## Configuración del entorno

Usar `.env.example` como plantilla local; nunca versionar valores reales ni
reutilizar secretos de la Web de clientes.

| Variable | Propósito |
| --- | --- |
| `APP_URL` | Origen público de Admin; se pasa explícitamente como `appBaseUrl` al SDK. HTTPS en producción. |
| `API_URL` | Dirección de la API accesible desde el servidor Next, no desde el navegador. |
| `AUTH0_DOMAIN` | Dominio del tenant que contiene la aplicación administrativa. |
| `AUTH0_CONNECTION` | Nombre de la Database Connection dedicada a Admin; el servidor la fija en cada autorización. |
| `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` | Credenciales de una Regular Web Application dedicada a Admin. |
| `AUTH0_SECRET` | Secreto independiente para cifrar cookies; generar con `openssl rand -hex 32`. |
| `AUTH0_AUDIENCE` | Identificador de la API en Auth0; no confundir con su dirección de red. |

El responsable del entorno debe configurar la RWA con callback
`<APP_URL>/auth/callback` y logout permitido `<APP_URL>`, habilitar su política
MFA y asegurar el provisionamiento del administrador en la API. La Web no crea
perfiles ni convierte cuentas de clientes o prestadores en administradores.
La conexión indicada por `AUTH0_CONNECTION` debe estar habilitada para esa RWA;
Admin no depende de la conexión predeterminada del tenant y reemplaza cualquier
intento de seleccionarla desde la URL de login.

Se solicita `openid profile email offline_access`: habilitar **Allow Offline
Access** en la API de Auth0 y el grant de Refresh Token para la RWA. El SDK
administra renovación, sesión y cookies; no implementar un refresh paralelo.
El flujo servidor a servidor hacia la API no requiere ampliar CORS del navegador.

## Fronteras de seguridad

- El navegador consulta únicamente `/api/admin/access`, con credenciales
  same-origin. Next obtiene el access token mediante el SDK de servidor y
  consulta `GET /me`; no usa el ID token como bearer.
- El mapper valida el contrato y solo entrega identidad pública del perfil.
  El rol `admin` se comprueba antes de devolver cualquier identidad al cliente.
- Sesión y transacciones usan cookies administrativas independientes. El endpoint
  público de access token del SDK está deshabilitado. Tokens y configuración
  privada no se serializan en props ni se registran en logs.
- Cada autorización fija en el servidor la Database Connection administrativa;
  parámetros de URL no pueden desviar el login hacia otro almacén de identidades.
- Las respuestas de acceso son privadas y sin caché. Cada consulta verifica su
  propia sesión y perfil. El shell de `/admin` no contiene datos protegidos.
  Nuevas operaciones administrativas deberán aplicar autorización en servidor;
  el estado visual no sustituye ese control.
- Sin sesión o con credenciales vencidas se ofrece autenticar, sin bucles.
  Una cuenta inexistente, un rol no administrativo y una falla temporal tienen
  mensajes distintos. Solo el error temporal ofrece reintento.
- Consulta de perfil: límite de 10 segundos; transporte del navegador: 15 segundos.
  Cancelación, desmontaje y reintento no permiten aplicar resultados obsoletos.
- El callback conserva el manejo de sesión del SDK: éxito hacia `/admin`, error
  hacia `/?auth=incomplete`, sin copiar detalles del proveedor ni destinos externos.

## Evidencia automatizada y sus límites

Los [criterios aprobados](us-3.2-login-acceptance.md) se ejecutan en
`features/auth/login.feature`. Los dobles E2E sustituyen las fronteras de login,
retorno y consulta de acceso; verifican navegación, identidad, estados, recuperación
y teclado. Las pruebas unitarias verifican SDK/configuración, callbacks,
repositorio, mappers, autorización, aislamiento y lifecycle de UI.

**Estas pruebas no acreditan un login real ni MFA real.** El entorno externo no
estaba configurado al entregar la implementación; el usuario aceptó dejar esta
comprobación pendiente. Los receipts y CI de delivery son la evidencia canónica
del cierre técnico, no una certificación de la configuración del tenant.

## Comprobación externa pendiente

En un entorno de prueba configurado por su responsable:

1. Iniciar sesión con el administrador provisionado y completar MFA; verificar
   retorno a `/admin` e identidad proveniente de `/me`.
2. Recargar y verificar renovación/continuidad de sesión. Con sesión vencida o
   refresh revocado, confirmar nueva autenticación sin bucle.
3. Cancelar o fallar el login/MFA y volver: no mostrar contenido administrativo;
   permitir otro intento. Si se abandona el portal sin retorno, la Web no puede
   observarlo; comprobar que regresar al inicio permite reintentar.
4. Usar identidades de prueba sin perfil y con rol cliente/prestador: confirmar
   mensajes correspondientes, sin alta automática ni exposición de identidad.
5. Simular indisponibilidad controlada de la API, restaurarla y reintentar.
6. Revisar cookies, respuestas y consola sin guardar tokens, credenciales, códigos
   MFA ni datos personales reales. Registrar únicamente resultado sanitizado.

No modificar la semilla administradora, Docker ni la API para esta comprobación.
