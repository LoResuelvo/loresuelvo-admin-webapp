Feature: Mantenimiento y desactivación de rubros con análisis de impacto
  Como administrador de LoResuelvo
  quiero editar y desactivar rubros del catálogo evaluando su impacto operativo
  para mantener actualizadas las áreas de servicio sin perjudicar órdenes ni prestadores activos

  Background:
    Given que he iniciado sesión en el panel de administración

  Scenario: 01-MNT Editar el nombre de un rubro exitosamente
    Given que existe el rubro "Plomería" en el catálogo
    And abro la edición del rubro "Plomería"
    When modifico el nombre por "Instalaciones Sanitarias" y guardo los cambios
    Then el modal de edición se cierra
    And veo un mensaje de confirmación de actualización
    And el catálogo muestra el rubro actualizado con el nombre "Instalaciones Sanitarias"

  Scenario: 02-MNT Validar nombre obligatorio al editar rubro
    Given que abro la edición del rubro "Plomería"
    When intento guardar el rubro con el nombre vacío
    Then veo un mensaje indicando que el nombre es obligatorio
    And el formulario de edición conserva el foco sin cerrarse

  Scenario: 03-MNT Rechazar nombre duplicado al editar rubro
    Given que existen los rubros "Plomería" y "Gasista"
    And abro la edición del rubro "Plomería"
    When intento cambiar el nombre por "Gasista"
    Then veo un mensaje indicando que el rubro ya existe
    And el formulario de edición permanece abierto

  Scenario: 04-MNT Visualizar análisis de impacto favorable y confirmar desactivación

    Given que el rubro "Cerrajería" no registra órdenes de trabajo activas en curso
    And solicito desactivar el rubro "Cerrajería"
    When confirmo la desactivación tras revisar el impacto de prestadores asociados
    Then el diálogo de impacto se cierra
    And veo un mensaje de confirmación de desactivación
    And el rubro "Cerrajería" se visualiza como inactivo en el catálogo

  @wip
  Scenario: 05-MNT Bloquear desactivación cuando existen órdenes de trabajo en curso
    Given que el rubro "Electricidad" registra órdenes de trabajo activas en curso
    When solicito desactivar el rubro "Electricidad"
    Then se presenta una advertencia de bloqueo operativo indicando la cantidad de órdenes activas que impiden desactivar el rubro

  @wip
  Scenario: 06-MNT Mostrar estado de espera mientras se calcula el impacto operativo
    Given que el cálculo de impacto de un rubro toma unos momentos
    When solicito desactivar el rubro "Pintura"
    Then se presenta un indicador de carga mientras se evalúa el impacto en prestadores y órdenes

  @wip
  Scenario: 07-MNT Informar falta de permisos para editar o desactivar rubros
    Given que mi cuenta de usuario no posee permisos de modificación de rubros
    When intento guardar la edición de un rubro
    Then el sistema me informa que el acceso está restringido

  @wip
  Scenario: 08-MNT Manejar problemas de conexión al actualizar o desactivar rubro
    Given que el servidor experimenta dificultades de comunicación al modificar un rubro
    When intento confirmar la modificación de un rubro
    Then se presenta un aviso informando el inconveniente con la posibilidad de reintentar
