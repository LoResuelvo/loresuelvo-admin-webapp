Feature: Consola de pagos y desglose económico
  Como operador autorizado de LoResuelvo
  quiero consultar los pagos y sus condiciones financieras
  para auditar cobros, señas, saldos y retenciones del marketplace

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-PAY Visualizar listado de pagos con desglose económico
    Given que existen transacciones registradas de señas y saldos en el sistema
    When accedo a la sección de pagos
    Then visualizo el listado de transacciones con el propósito, cliente, prestador, total del servicio, neto del prestador, comisión de plataforma y estado

  @wip
  Scenario: 02-PAY Diferenciar visualmente intención de checkout de pago acreditado
    Given que existe una transacción con checkout iniciado pero pendiente de cobro
    When consulto el listado en la sección de pagos
    Then el pago se visualiza con estado pendiente sin computarse como cobro acreditado

  @wip
  Scenario: 03-PAY Buscar pagos por referencia externa o participante
    Given que existen pagos registrados vinculados a operaciones del marketplace
    When realizo una búsqueda por la referencia "MP-REF-45892"
    Then el listado contiene únicamente la transacción vinculada a esa referencia

  @wip
  Scenario: 04-PAY Filtrar pagos por propósito y estado
    Given que existen múltiples pagos registrados de señas y saldos
    When aplico los filtros para ver pagos de seña con estado aprobado
    Then el listado muestra exclusivamente los cobros de seña que se encuentran aprobados

  @wip
  Scenario: 05-PAY Mostrar estado de espera mientras se cargan los pagos
    Given que la consulta de transacciones financieras toma unos momentos
    When accedo a la sección de pagos
    Then se presenta una vista de carga con indicadores visuales mientras se obtiene la información

  @wip
  Scenario: 06-PAY Informar ausencia de pagos o sin coincidencias de filtros
    Given que no existen transacciones que coincidan con el criterio seleccionado
    When aplico un filtro de búsqueda sin resultados en la sección de pagos
    Then se muestra un mensaje informativo indicando que no hay transacciones disponibles

  @wip
  Scenario: 07-PAY Informar falta de permisos para consultar pagos
    Given que mi cuenta de usuario no posee permisos para consultar información financiera
    When intento ingresar a la sección de pagos
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 08-PAY Manejar dificultades de comunicación con el servicio
    Given que el sistema experimenta problemas de conexión con el servidor
    When intento consultar la sección de pagos
    Then se presenta un aviso informando el inconveniente con la opción de reintentar la carga
