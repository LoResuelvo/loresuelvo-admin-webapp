Feature: Consulta del chat de una contratación
  Como operador de soporte de LoResuelvo
  quiero acceder a la conversación entre el cliente y el prestador directamente
  para investigar reclamos o incidentes respetando la privacidad de las partes

  Background:
    Given que he iniciado sesión en el panel de administración
    And me encuentro en la ficha de una contratación

  Scenario: 01-CHT Consultar la conversación directamente
    Given que selecciono la opción para inspeccionar los mensajes
    When se abre la conversación
    Then visualizo los mensajes ordenados cronológicamente distinguiendo las intervenciones del cliente y del prestador

  Scenario: 02-CHT Acceder sin seleccionar una causa
    Given que me encuentro en el diálogo de acceso a la conversación
    When se abre la conversación
    Then no se solicita una causa ni una confirmación de acceso

  Scenario: 03-CHT Mostrar estado de espera mientras se obtienen los mensajes
    Given que la obtención de los mensajes toma unos momentos
    When se abre la conversación
    Then se presenta una vista de carga con indicadores visuales mientras se recupera la conversación

  Scenario: 04-CHT Informar ausencia de mensajes en una conversación sin actividad
    Given que la contratación no registra mensajes intercambiados entre las partes
    When intento acceder a la conversación
    Then visualizo un mensaje indicando que no se registran mensajes en esta contratación

  Scenario: 05-CHT Informar falta de permisos para auditar mensajes
    Given que mi cuenta de usuario no posee permisos de soporte para ver mensajes privados
    When intento acceder a la conversación
    Then el sistema me informa que el acceso está restringido

  Scenario: 06-CHT Manejar dificultades de comunicación con el servicio
    Given que el sistema experimenta problemas de conexión con el servidor
    When intento acceder a la conversación
    Then se presenta un aviso informando el inconveniente con la opción de reintentar
