Feature: Ficha y diagnóstico operativo de prestadores
  Como operador de LoResuelvo
  quiero consultar el diagnóstico operativo de un prestador
  para identificar las causas de bloqueos o restricciones en su actividad

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-DIA Visualizar perfil y panel de diagnóstico operativo completo
    Given que existe un prestador registrado en el marketplace
    When consulto la ficha de diagnóstico del prestador
    Then visualizo sus datos de contacto, rubro asignado y el panel de condiciones operativas con los estados de identidad, cobros, zonas y calendario

  Scenario: 02-DIA Diagnosticar condición de cobros de Mercado Pago desconectada
    Given que el prestador no ha vinculado su cuenta de cobro en la pasarela de pagos
    When consulto su ficha de diagnóstico operativo
    Then la condición de cobros se visualiza desconectada indicando que no puede recibir señas ni pagos

  Scenario: 03-DIA Reflejar estado real de verificación de identidad sin inferir suspensiones
    Given que el prestador tiene su verificación de identidad pendiente de revisión
    When consulto su ficha de diagnóstico operativo
    Then se visualiza el estado real de identidad sin atribuirle una suspensión operativa injustificada

  Scenario: 04-DIA Visualizar zonas de cobertura asignadas y su habilitación
    Given que el prestador posee zonas de cobertura configuradas en su cuenta
    When consulto la sección de cobertura en su ficha de diagnóstico
    Then visualizo el listado de zonas asignadas y cuáles se encuentran activas para recibir solicitudes

  Scenario: 05-DIA Visualizar resumen de actividad e historial de contrataciones
    Given que el prestador registra actividad previa de solicitudes y órdenes
    When consulto la sección de actividad en la ficha del prestador
    Then visualizo el resumen de trabajos con accesos directos hacia sus contrataciones en el Centro de Operaciones

  Scenario: 06-DIA Mostrar estado de espera mientras se carga la ficha del prestador
    Given que la consulta del diagnóstico del prestador toma unos momentos
    When accedo a la ficha de diagnóstico del prestador
    Then se presenta una vista de carga con indicadores visuales mientras se obtiene la información

  @wip
  Scenario: 07-DIA Informar prestador inexistente
    Given que intento consultar un prestador que no se encuentra registrado
    When accedo al enlace de diagnóstico del prestador
    Then se presenta un mensaje claro indicando que el prestador no fue encontrado

  @wip
  Scenario: 08-DIA Informar falta de permisos para consultar el diagnóstico
    Given que mi cuenta de usuario no posee permisos para consultar el detalle de prestadores
    When intento ingresar a la ficha de diagnóstico del prestador
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 09-DIA Manejar dificultades de comunicación con el servicio
    Given que el sistema experimenta problemas de conexión con el servidor
    When intento consultar la ficha de diagnóstico del prestador
    Then se presenta un aviso informando el inconveniente con la opción de reintentar la carga
