Feature: Bandeja transversal de operaciones y contrataciones
  Como operador de LoResuelvo
  quiero consultar una bandeja transversal de contrataciones
  para monitorear el estado y los cuellos de botella del marketplace

  Background:
    Given que he iniciado sesión en el panel de administración

  @wip
  Scenario: 01-OP Visualizar contrataciones con información operativa y cuellos de botella
    Given que existen contrataciones en curso con diferentes estados en el marketplace
    When ingreso a la sección de operaciones
    Then visualizo el listado de contrataciones con el cliente, prestador, rubro, estado actual, la alerta operativa detectada y el responsable de avanzar el servicio

  @wip
  Scenario: 02-OP Mostrar estado de espera mientras se cargan las operaciones
    Given que la carga de las operaciones toma unos momentos
    When ingreso a la sección de operaciones
    Then se presenta una vista de carga con indicadores visuales mientras se obtiene la información

  @wip
  Scenario: 03-OP Filtrar contrataciones por alertas de cuello de botella
    Given que existen contrataciones con solicitudes demoradas por más de 24 horas y otras al día
    When filtro las operaciones seleccionando la alerta "Estancada > 24h"
    Then se presentan únicamente los trabajos que requieren atención por llevar más de un día sin avance

  @wip
  Scenario: 04-OP Filtrar contrataciones por rubro y buscar por participante
    Given que existen contrataciones en diversos rubros y con distintos clientes
    When busco por el apellido "Pérez" y selecciono el rubro "Plomería"
    Then el listado muestra exclusivamente los servicios que coinciden con el rubro y el participante buscado

  @wip
  Scenario: 05-OP Informar ausencia de operaciones registradas o sin coincidencias
    Given que no existen contrataciones que coincidan con el criterio seleccionado
    When aplico el filtro en la bandeja de operaciones
    Then se presenta un mensaje indicando que no se encontraron operaciones disponibles

  @wip
  Scenario: 06-OP Informar falta de permisos para supervisar operaciones
    Given que mi cuenta de usuario no posee permisos para gestionar operaciones
    When intento ingresar a la sección de operaciones
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 07-OP Manejar problemas de conexión al consultar operaciones
    Given que el sistema experimenta dificultades de conexión con el servidor
    When intento consultar la sección de operaciones
    Then se presenta un aviso informando el inconveniente con la posibilidad de reintentar la carga

  @wip
  Scenario: 08-OP Acceder a los detalles de una contratación desde el listado
    Given que visualizo una contratación en la bandeja de operaciones
    When selecciono la contratación para inspeccionarla
    Then accedo a la ficha con el detalle completo del servicio
