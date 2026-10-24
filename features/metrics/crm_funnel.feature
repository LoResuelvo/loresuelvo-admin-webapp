Feature: Lectura y comparación de embudos de contratación
  Como responsable de operaciones
  quiero distinguir las bases de conversión y comparar solicitudes por origen
  para interpretar el avance de las contrataciones sin mezclar unidades

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 09-MET Comprender las dos bases porcentuales del recorrido IA
    Given que una cohorte IA contiene 100 evaluaciones profesionales, 60 con solicitud y 30 con propuesta
    When consulto el recorrido Origen IA
    Then veo 100%, 60% y 30% sobre las evaluaciones iniciales
    And veo 60% y 50% de avance desde la etapa anterior con sus denominadores
    And las barras usan exclusivamente el porcentaje sobre el inicio
    And se identifica que la unidad contada es la evaluación profesional
    And la metodología permanece plegada y la base inicial destaca en el resumen global

  Scenario: 10-MET Consultar el recorrido manual de forma independiente
    Given que la respuesta contiene solicitudes manuales y evaluaciones de origen IA
    When selecciono el recorrido Manual
    Then veo únicamente las solicitudes manuales y sus hitos desde solicitud hasta reseña
    And sus porcentajes usan sus propias solicitudes como base inicial
    And el indicador global identifica su numerador y denominador

  Scenario: 11-MET Comparar orígenes sobre solicitudes equivalentes
    Given que una evaluación origina dos solicitudes y existen tres solicitudes manuales creadas en el mismo período
    And existen avances posteriores al fin del período y varias propuestas para una misma solicitud
    When selecciono Comparar
    Then veo bases de dos solicitudes IA y tres manuales con las mismas etapas y criterio de rubro
    And cada solicitud cuenta una sola vez por etapa con sus avances vinculados observados al consultar
    And cada origen muestra sus propias tasas sobre solicitudes sin mezclar denominadores
    And se informa que el período selecciona la creación de las solicitudes

  Scenario: 12-MET Diferenciar ausencia de base y ausencia de avance
    Given que una cohorte no tiene casos iniciales y otra tiene casos iniciales sin avances
    When consulto sus indicadores
    Then la cohorte vacía muestra conteos cero y porcentajes sin base como no disponibles
    And la cohorte con base positiva muestra cero por ciento para las etapas sin avances
    And ninguna barra representa volumen positivo para una etapa con cero casos

  Scenario: 13-MET Interpretar la observación y las demoras
    Given que la respuesta incluye el período efectivo, la fecha de observación y demoras con su cantidad de observaciones
    When consulto el detalle del embudo
    Then veo el período y la fecha de observación
    And las demoras disponibles indican su cantidad de observaciones
    And se aclara que son tiempos de transiciones realizadas y no espera de casos pendientes

  Scenario: 14-MET Aplicar los mismos filtros a la comparación
    Given que estoy comparando solicitudes IA y manuales
    When aplico un período y un rubro
    Then ambos orígenes usan exactamente esos filtros y muestran su período efectivo
    And la comparación mantiene solicitudes como unidad inicial en ambos orígenes
