Feature: Métricas de embudo de conversión operativa
  Como responsable de operaciones de LoResuelvo
  quiero consultar las métricas y tasas de conversión del embudo de servicios
  para detectar puntos de fricción y estancamiento en el ciclo de contratación

  Background:
    Given que he iniciado sesión en el panel de administración

  @wip
  Scenario: 01-MET Visualizar etapas secuenciales del embudo operativo y conversión global
    Given que existen datos de operaciones registradas en el marketplace
    When accedo a la sección de métricas en "/metricas"
    Then visualizo las etapas del embudo desde el diagnóstico hasta la reseña con sus volúmenes y la tasa de conversión global

  @wip
  Scenario: 02-MET Visualizar tasas de retención y tiempo promedio de permanencia por etapa
    Given que el embudo de contratación muestra las transiciones entre etapas
    When inspecciono el paso de solicitudes a propuestas
    Then visualizo el porcentaje de conversión relativo y el tiempo promedio transcurrido entre ambos hitos

  @wip
  Scenario: 03-MET Filtrar métricas por período temporal
    Given que me encuentro en la consola de métricas
    When selecciono el rango temporal "Últimos 30 días"
    Then los indicadores y el gráfico del embudo se actualizan reflejando exclusivamente el período seleccionado

  @wip
  Scenario: 04-MET Filtrar embudo por rubro de servicio
    Given que el marketplace abarca diversos oficios
    When filtro el embudo por el rubro "Plomería"
    Then las etapas reflejan las métricas de conversión exclusivas de contrataciones de plomería

  @wip
  Scenario: 05-MET Informar período sin datos o volumen insuficiente
    Given que selecciono un rango de fechas sin actividad registrada
    When aplico el filtro en la sección de métricas
    Then se presenta un mensaje informativo indicando que no hay suficiente volumen para generar el embudo

  @wip
  Scenario: 06-MET Mostrar estado de espera mientras se computan las métricas
    Given que el cálculo analítico de las métricas toma unos momentos
    When accedo a la sección de métricas
    Then se presenta una vista de carga con indicadores visuales mientras se procesan las agregaciones

  @wip
  Scenario: 07-MET Informar falta de permisos para consultar métricas
    Given que mi cuenta de usuario no posee permisos de analítica
    When intento ingresar a la sección de métricas
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 08-MET Manejar fallos de conexión al consultar el embudo
    Given que el servidor de métricas no se encuentra disponible
    When intento consultar la consola de métricas
    Then se presenta un aviso informando el inconveniente con la posibilidad de reintentar
