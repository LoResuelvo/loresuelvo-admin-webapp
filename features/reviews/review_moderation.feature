Feature: Moderación de reseñas y comentarios
  Como operador de moderación de LoResuelvo
  quiero supervisar reseñas denunciadas y moderar su visibilidad pública
  para proteger a la comunidad de contenido ofensivo preservando la trazabilidad histórica

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-REV Visualizar el resumen de reseñas reportadas con datos disponibles
    Given que existen reseñas denunciadas por usuarios en el marketplace
    When accedo a la sección de moderación
    Then se priorizan las reseñas con reportes pendientes y visualizo su calificación, fecha y acciones; consulto IDs y comentarios disponibles en el detalle

  Scenario: 02-REV Ocultar reseña ofensiva con categoría de infracción
    Given que identifico una reseña reportada con lenguaje agraviante
    When oculto la reseña seleccionando la infracción "Lenguaje abusivo u ofensivo"
    Then el estado de la reseña pasa a "Ocultada"
    And veo una confirmación de la moderación aplicada

  Scenario: 03-REV Restablecer visibilidad pública de una reseña previamente ocultada
    Given que existe una reseña en estado "Ocultada" y estoy viendo todas las reseñas
    When solicito restablecer la visibilidad pública
    Then el estado de la reseña pasa nuevamente a "Visible"
    And veo una confirmación del restablecimiento aplicado

  Scenario: 04-REV Validar campos obligatorios al moderar reseña
    Given que me encuentro en el formulario de moderación de una reseña
    When intento confirmar la moderación sin seleccionar una categoría de infracción
    Then veo un mensaje indicando que la categoría de infracción es requerida
    And la acción no se procesa

  Scenario: 05-REV Filtrar reseñas por visibilidad pública
    Given que existen reseñas visibles, reportadas y ocultadas
    When filtro el listado por visibilidad "Ocultada"
    Then el listado presenta únicamente las reseñas que fueron retiradas de la vista pública

  Scenario: 06-REV Mostrar estado de espera mientras se consultan las reseñas
    Given que la consulta de reseñas toma unos momentos
    When accedo a la sección de moderación
    Then se presenta una vista de carga con indicadores visuales mientras se recuperan los comentarios

  Scenario: 07-REV Informar falta de permisos para acceder a la moderación
    Given que mi cuenta de usuario no posee permisos de moderación
    When intento ingresar a la sección de moderación
    Then el sistema me informa que el acceso está restringido

  Scenario: 08-REV Manejar inconvenientes de conexión al moderar reseñas
    Given que el servicio de moderación experimenta dificultades de red
    When intento confirmar la moderación de una reseña
    Then se presenta un aviso informando el inconveniente con la posibilidad de reintentar
