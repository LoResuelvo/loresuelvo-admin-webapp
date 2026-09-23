Feature: Ficha unificada de contratación y trazabilidad operativa
  Como operador de LoResuelvo
  quiero consultar la ficha unificada de una contratación
  para revisar su historial completo, hitos y evidencias de ejecución

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-FCH Visualizar datos principales de las partes y el servicio
    Given que existe una contratación registrada entre un cliente y un prestador
    When consulto la ficha de la contratación
    Then visualizo los datos de contacto del cliente, los del prestador, el rubro y el domicilio registrado

  Scenario: 02-FCH Visualizar línea de tiempo del recorrido del servicio
    Given que la contratación ha transitado desde la solicitud inicial hasta la orden de trabajo
    When consulto la ficha de la contratación
    Then visualizo una línea de tiempo cronológica con cada evento ocurrido, la fecha y hora registrada y su avance

  Scenario: 03-FCH Visualizar solicitud inicial y diagnóstico asistido por IA
    Given que la solicitud del cliente fue generada mediante el asistente de diagnóstico virtual
    When reviso la sección de solicitud en la ficha
    Then visualizo el diagnóstico del problema sugerido por el asistente, la descripción y las fotos adjuntas

  Scenario: 04-FCH Visualizar condiciones pactadas y estado de la orden
    Given que la contratación posee un presupuesto acordado y una orden programada
    When reviso la sección de presupuesto y orden en la ficha
    Then visualizo el valor total acordado, el porcentaje de seña, las fechas comprometidas y el estado de la orden

  @wip
  Scenario: 05-FCH Visualizar reporte de cierre del prestador y reseña del cliente
    Given que el prestador concluyó el trabajo y el cliente dejó su valoración
    When reviso la sección de finalización en la ficha
    Then visualizo el informe del trabajo realizado con las fotos de evidencia y la reseña con calificación del cliente

  @wip
  Scenario: 06-FCH Mostrar estado de espera mientras se carga la ficha
    Given que la carga del detalle del servicio toma unos momentos
    When accedo a la ficha de la contratación
    Then se presenta una vista de carga con indicadores visuales mientras se obtiene la información

  @wip
  Scenario: 07-FCH Informar cuando la contratación solicitada no existe
    Given que intento consultar una contratación que no se encuentra registrada
    When accedo al enlace de la contratación
    Then se presenta un mensaje claro indicando que el servicio no fue encontrado

  @wip
  Scenario: 08-FCH Informar falta de permisos para consultar el detalle de contrataciones
    Given que mi cuenta de usuario no posee permisos para ver el detalle de operaciones
    When intento ingresar a la ficha de una contratación
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 09-FCH Manejar problemas de conexión al cargar la ficha
    Given que el sistema experimenta dificultades de conexión con el servidor
    When intento cargar la ficha de la contratación
    Then se presenta un aviso informando el inconveniente con la posibilidad de reintentar la carga
