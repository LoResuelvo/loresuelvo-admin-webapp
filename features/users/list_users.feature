Feature: Listar usuarios registrados
  Como administrador de LoResuelvo
  quiero visualizar y consultar por separado a los consumidores y prestadores registrados
  para supervisar la operación del marketplace

  Background:
    Given que estoy autenticado como administrador

  # --- Directorio de Consumidores ---

  Scenario: 01-USR Visualizar directorio de consumidores con datos completos
    Given que existen los siguientes consumidores registrados:
      | nombre  | apellido | correo              | fecha_registro |
      | Ana     | Pérez    | ana@example.com     | 2026-09-10     |
      | Beatriz | Suárez   | beatriz@example.com | 2026-09-12     |
    When ingreso al directorio de consumidores
    Then veo el listado de consumidores con su foto, nombre, apellido, correo y fecha de registro
    And la vista no incluye a prestadores ni administradores

  Scenario: 02-USR Mostrar estado de carga al consultar consumidores
    Given que la consulta del directorio de consumidores tarda en responder
    When ingreso al directorio de consumidores
    Then veo un indicador de carga mientras se obtienen los datos

  Scenario: 03-USR Buscar consumidores por nombre, apellido o correo
    Given que existen los siguientes consumidores registrados:
      | nombre  | apellido | correo              |
      | Ana     | Pérez    | ana.perez@test.com  |
      | Beatriz | Suárez   | beatriz@test.com    |
    When busco en el directorio de consumidores con el texto "perez"
    Then el listado contiene únicamente a "ana.perez@test.com"

  Scenario: 04-USR Informar ausencia de consumidores o sin coincidencias de búsqueda
    Given que no existen consumidores registrados
    When ingreso al directorio de consumidores
    Then veo un mensaje indicando que no hay consumidores disponibles

  @wip
  Scenario: 05-USR Informar permisos insuficientes al consultar consumidores
    Given que mi cuenta no tiene el permiso "read:consumers"
    When intento ingresar al directorio de consumidores
    Then veo un mensaje informativo de acceso restringido

  @wip
  Scenario: 06-USR Manejar error de conexión al consultar consumidores
    Given que el servicio de consulta de consumidores no está disponible
    When ingreso al directorio de consumidores
    Then veo un mensaje de error recuperable con opción de reintentar

  # --- Directorio de Prestadores ---

  @wip
  Scenario: 07-USR Visualizar directorio de prestadores con información operativa
    Given que existen los siguientes prestadores registrados:
      | nombre | apellido | correo           | rubro    | zonas               | estado_verificacion |
      | Juan   | Gómez    | juan@example.com | Plomería | Comuna 6, Comuna 14 | approved            |
    When ingreso al directorio de prestadores
    Then veo el listado de prestadores con su rubro, zonas de cobertura y estado de verificación

  @wip
  Scenario: 08-USR Mostrar estado de carga al consultar prestadores
    Given que la consulta del directorio de prestadores tarda en responder
    When ingreso al directorio de prestadores
    Then veo un indicador de carga mientras se obtienen los datos

  @wip
  Scenario: 09-USR Filtrar prestadores por atributos operativos y búsqueda
    Given que existen los siguientes prestadores registrados:
      | nombre | apellido | correo            | rubro        | zona      | estado_verificacion |
      | Juan   | Gómez    | juan@example.com  | Plomería     | Comuna 6  | approved            |
      | Laura  | Díaz     | laura@example.com | Electricidad | Comuna 14 | in_review           |
    When filtro los prestadores por el rubro "Plomería" y el estado "approved"
    Then el listado contiene únicamente a "juan@example.com"

  @wip
  Scenario: 10-USR Informar ausencia de prestadores o sin coincidencias de filtros
    Given que no existen prestadores que coincidan con los filtros aplicados
    When aplico los filtros en el directorio de prestadores
    Then veo un mensaje indicando que no hay prestadores disponibles

  @wip
  Scenario: 11-USR Informar permisos insuficientes al consultar prestadores
    Given que mi cuenta no tiene el permiso "read:providers"
    When intento ingresar al directorio de prestadores
    Then veo un mensaje informativo de acceso restringido

  @wip
  Scenario: 12-USR Manejar error de conexión al consultar prestadores
    Given que el servicio de consulta de prestadores no está disponible
    When ingreso al directorio de prestadores
    Then veo un mensaje de error recuperable con opción de reintentar
