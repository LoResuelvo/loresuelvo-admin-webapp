Feature: Gestión de rubros
  Como administrador de LoResuelvo
  quiero gestionar el catálogo de rubros disponibles
  para mantener actualizadas las áreas de servicio de la plataforma

  Background:
    Given que estoy autenticado como administrador

  Scenario: 01-RUB Mostrar el catálogo de rubros
    Given que existen los siguientes rubros:
      | id | nombre       |
      | 1  | Albañilería  |
      | 2  | Electricidad |
      | 3  | Plomería     |
    When ingreso a la sección de rubros
    Then veo los rubros ordenados alfabéticamente con su identificador y nombre

  Scenario: 02-RUB Mostrar estado de carga al consultar rubros
    Given que la consulta de rubros tarda en responder
    When ingreso a la sección de rubros
    Then veo un indicador de carga mientras se obtienen los datos

  @wip
  Scenario: 03-RUB Informar que no existen rubros registrados
    Given que no existen rubros registrados
    When ingreso a la sección de rubros
    Then veo un mensaje indicando que no hay rubros registrados

  @wip
  Scenario: 04-RUB Manejar error de conexión al consultar rubros
    Given que el servicio de consulta de rubros no está disponible
    When ingreso a la sección de rubros
    Then veo un mensaje de error indicando que no se pudieron obtener los rubros

  @wip
  Scenario: 05-RUB Crear un rubro exitosamente
    Given que no existen rubros registrados
    And abro el formulario de creación de rubro
    When creo el rubro "Plomería"
    Then el modal se cierra
    And veo un mensaje de confirmación
    And el rubro "Plomería" aparece en el catálogo

  @wip
  Scenario: 06-RUB Deshabilitar envío y mostrar carga mientras se procesa la creación
    Given que abro el formulario de creación de rubro
    When inicio la creación del rubro "Plomería"
    Then el botón de envío se deshabilita y muestra estado de carga

  @wip
  Scenario: 07-RUB Validar nombre obligatorio al crear rubro
    Given que abro el formulario de creación de rubro
    When intento crear un rubro sin completar el nombre
    Then veo un mensaje indicando que el nombre es obligatorio
    And el modal permanece abierto

  @wip
  Scenario: 08-RUB Rechazar rubro duplicado
    Given que existe el rubro "Plomería"
    And abro el formulario de creación de rubro
    When intento crear el rubro "Plomería"
    Then veo un mensaje indicando que el rubro ya existe
    And el formulario conserva el texto ingresado

  @wip
  Scenario: 09-RUB Informar permisos insuficientes al crear rubro
    Given que mi cuenta no tiene el permiso de creación de rubros
    And abro el formulario de creación de rubro
    When intento crear el rubro "Plomería"
    Then veo un mensaje indicando que no tengo permisos suficientes
    And el formulario conserva el texto ingresado

  @wip
  Scenario: 10-RUB Manejar error de servidor al crear rubro
    Given que el servicio de creación de rubros no está disponible
    And abro el formulario de creación de rubro
    When intento crear el rubro "Plomería"
    Then veo un mensaje de error recuperable
    And el formulario conserva el texto ingresado
