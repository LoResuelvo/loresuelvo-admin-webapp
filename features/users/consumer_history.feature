Feature: Ficha e historial de contrataciones de consumidores
  Como operador de LoResuelvo
  quiero consultar la ficha y el historial de un consumidor
  para conocer su actividad y contrataciones ante solicitudes de soporte

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-CSM Visualizar perfil del consumidor y domicilio actual
    Given que existe un consumidor registrado en el marketplace
    When consulto la ficha del consumidor
    Then visualizo sus datos de contacto, fecha de registro y la dirección habitual registrada

  Scenario: 02-CSM Visualizar historial cronológico de contrataciones con acceso a operaciones
    Given que el consumidor registra actividad de contrataciones en la plataforma
    When consulto el historial en la ficha del consumidor
    Then visualizo la lista cronológica de servicios con fecha, rubro, prestador asignado, estado y acceso al detalle operativo

  Scenario: 03-CSM Filtrar historial por tipo de interacción y estado
    Given que el consumidor posee múltiples interacciones registradas
    When aplico los filtros para ver órdenes de trabajo con estado completada
    Then el historial muestra exclusivamente las órdenes finalizadas del consumidor

  @wip
  Scenario: 04-CSM Informar ausencia de actividad previa
    Given que el consumidor registrado aún no ha emitido solicitudes ni contrataciones
    When consulto el historial de actividad en su ficha
    Then se presenta un mensaje informativo indicando que el consumidor no registra contrataciones previas

  @wip
  Scenario: 05-CSM Mostrar estado de espera mientras se carga la ficha del consumidor
    Given que la consulta de los datos del consumidor toma unos momentos
    When accedo a la ficha del consumidor
    Then se presenta una vista de carga con indicadores visuales mientras se obtiene la información

  @wip
  Scenario: 06-CSM Informar consumidor inexistente
    Given que intento consultar un consumidor que no se encuentra registrado
    When accedo al enlace de la ficha del consumidor
    Then se presenta un mensaje claro indicando que el consumidor no fue encontrado

  @wip
  Scenario: 07-CSM Informar falta de permisos para consultar la ficha
    Given que mi cuenta de usuario no posee permisos para consultar el detalle de consumidores
    When intento ingresar a la ficha del consumidor
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 08-CSM Manejar dificultades de comunicación con el servicio
    Given que el sistema experimenta problemas de conexión con el servidor
    When intento consultar la ficha del consumidor
    Then se presenta un aviso informando el inconveniente con la opción de reintentar la carga
