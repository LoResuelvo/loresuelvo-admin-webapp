Feature: Expediente de reclamos y resolución de disputas
  Como operador de soporte de LoResuelvo
  quiero gestionar reclamos de usuarios y registrar dictámenes de mediación
  para resolver disputas operativas basadas en evidencias y mantener la transparencia

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-CLM Visualizar listado de reclamos e incidentes operativos con estado y urgencia
    Given que existen reclamos formales registrados en el sistema
    When accedo a la sección de reclamos en "/reclamos"
    Then visualizo el listado de quejas con la fecha, reclamante, rubro, estado y nivel de urgencia

  Scenario: 02-CLM Consultar expediente completo del reclamo con evidencias y acceso a la contratación
    Given que existe un reclamo en estado "En revisión" con ID "clm-101"
    When accedo al expediente del reclamo en "/reclamos/clm-101"
    Then visualizo la descripción del conflicto, las fotos de evidencia y el enlace directo hacia la contratación asociada

  Scenario: 03-CLM Registrar dictamen de resolución de mediación con motivo justificado
    Given que me encuentro en el expediente de un reclamo abierto
    When registro la resolución "A favor del cliente" con el motivo "Incumplimiento de visita pactada sin aviso previo"
    Then el estado del reclamo se actualiza a "Resuelto"
    And veo una confirmación del dictamen registrado

  Scenario: 04-CLM Validar campos obligatorios al emitir resolución de reclamo
    Given que me encuentro en el formulario de dictamen del reclamo
    When intento confirmar la resolución sin completar el motivo justificado
    Then veo un mensaje indicando que el motivo de resolución es obligatorio
    And el formulario no se envía

  Scenario: 05-CLM Filtrar reclamos por estado y buscar por participante
    Given que existen reclamos abiertos y resueltos de diferentes participantes
    When filtro por estado "Abierto" y busco el apellido "López"
    Then el listado presenta únicamente las disputas abiertas vinculadas al participante buscado

  Scenario: 06-CLM Mostrar estado de espera mientras se recupera el expediente
    Given que la consulta del expediente del reclamo toma unos momentos
    When accedo al detalle del reclamo
    Then se presenta una vista de carga con indicadores visuales mientras se obtienen los antecedentes

  @wip
  Scenario: 07-CLM Informar falta de permisos para gestionar reclamos
    Given que mi cuenta de usuario no posee permisos de mediación
    When intento ingresar a la sección de reclamos
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 08-CLM Manejar errores de comunicación al consultar o resolver reclamos
    Given que el servidor de soporte experimenta inconvenientes
    When intento registrar el dictamen de un reclamo
    Then se presenta un aviso informando el inconveniente con la posibilidad de reintentar
