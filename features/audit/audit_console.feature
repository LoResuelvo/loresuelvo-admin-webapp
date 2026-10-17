Feature: Consola de auditoría y registro de acciones administrativas
  Como oficial de seguridad de LoResuelvo
  quiero consultar la bitácora inmutable de acciones de operadores
  para supervisar accesos a datos sensibles y garantizar la trazabilidad de decisiones críticas

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-AUD Visualizar bitácora cronológica de acciones de operadores con motivo justificado
    Given que existen intervenciones administrativas registradas en la plataforma
    When accedo a la sección de auditoría
    Then visualizo los registros ordenados por fecha con el ID real del operador, el recurso, la acción, el resultado y el motivo disponible

  Scenario: 02-AUD Filtrar registros de auditoría por tipo de acción sensible
    Given que la bitácora registra acciones de acceso y ejecución
    When filtro los registros por la acción "Acceso"
    Then se presentan únicamente las intervenciones cuya acción es "Acceso"

  Scenario: 03-AUD Filtrar registros por operador interviniente
    Given que distintos operadores han registrado intervenciones en la plataforma
    When busco los registros asociados al ID de operador "101"
    Then el listado expone exclusivamente las intervenciones realizadas por el operador con ID 101

  Scenario: 04-AUD Filtrar intervenciones dentro de un rango de fechas
    Given que existen registros de auditoría de varios meses
    When selecciono el rango temporal entre "2026-09-01" y "2026-09-20"
    Then visualizo únicamente las intervenciones comprendidas dentro del período seleccionado

  Scenario: 05-AUD Inspeccionar información detallada y contexto de una intervención
    Given que selecciono una intervención de la bitácora de auditoría
    When abro la ficha de detalle de la intervención
    Then visualizo el ID del operador, la acción, el resultado y el identificador de correlación provistos por la API sin inventar datos de origen

  Scenario: 06-AUD Mostrar estado de espera mientras se recupera la bitácora
    Given que la consulta de intervenciones toma unos momentos
    When accedo a la sección de auditoría
    Then se presenta una vista de carga con indicadores visuales mientras se obtienen los datos

  Scenario: 07-AUD Informar falta de permisos para consultar la bitácora de seguridad
    Given que mi cuenta de usuario no posee permisos de auditoría
    When intento ingresar a la sección de auditoría
    Then el sistema me informa que el acceso está restringido

  Scenario: 08-AUD Manejar inconvenientes de conexión al consultar la auditoría
    Given que el servicio de auditoría experimenta inconvenientes
    When intento consultar la consola de auditoría
    Then se presenta un aviso informando el inconveniente con la posibilidad de reintentar

  Scenario: 09-AUD Continuar la bitácora usando el cursor de la página siguiente
    Given que existe una página adicional de registros de auditoría
    When solicito la página siguiente de la bitácora
    Then se agregan sus registros al listado y se oculta la opción de continuar cuando no hay otro cursor
