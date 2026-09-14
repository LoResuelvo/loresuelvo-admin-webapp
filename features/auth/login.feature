Feature: Iniciar sesión como administrador
  Como administrador
  Quiero iniciar sesión en Lo Resuelvo
  Para acceder al área de administración

  Scenario: 01-ADM Mostrar la entrada de administración
    Given que no tengo una sesión activa
    When entro a la página de inicio
    Then veo la identidad de Lo Resuelvo y el botón "Iniciar sesión"
    And no veo un formulario de contraseña ni una opción de registro

  Scenario: 02-ADM Redirección al portal de autenticación
    Given que estoy en la página de inicio
    When hago clic en el botón "Iniciar sesión"
    Then soy redirigido al portal de autenticación de Auth0
    And no puedo iniciar otra solicitud mientras se procesa la redirección

  Scenario Outline: 03-ADM Esperar la verificación de acceso
    Given que todavía se está verificando <verificacion>
    When entro al área de administración
    Then veo un mensaje que indica que se está verificando mi acceso
    And no veo contenido administrativo
    Examples:
      | verificacion |
      | mi sesión    |
      | mi perfil    |

  Scenario: 04-ADM Inicio de sesión exitoso como administrador
    Given que inicié sesión exitosamente en Auth0
    And tengo una cuenta de administrador habilitada con nombre "Ana", apellido "Pérez" y correo "ana@example.com"
    When entro al área de administración
    Then veo mi nombre "Ana", apellido "Pérez" y correo "ana@example.com"
    And puedo acceder al área de administración

  Scenario: 05-ADM Acceso directo sin sesión activa
    Given que no tengo una sesión activa
    When entro directamente al área de administración
    Then se me ofrece iniciar sesión
    And no veo contenido administrativo
    And no soy redirigido repetidamente

  Scenario: 06-ADM Conservar el acceso al recargar
    Given que tengo una sesión activa
    And tengo una cuenta de administrador habilitada en Lo Resuelvo
    And estoy en el área de administración
    When recargo la página
    Then vuelvo a acceder al área de administración con mi identidad verificada

  Scenario: 07-ADM Solicitar una nueva autenticación
    Given que mi autenticación dejó de ser válida
    When entro al área de administración
    Then veo un mensaje que indica que debo iniciar sesión nuevamente
    And no veo contenido administrativo
    And no soy redirigido repetidamente

  @wip
  Scenario: 08-ADM Acceso con una cuenta sin habilitación en la plataforma
    Given que inicié sesión exitosamente en Auth0
    And mi cuenta no está habilitada en Lo Resuelvo
    When entro al área de administración
    Then veo un mensaje que indica que mi cuenta no está habilitada y que debo contactar al responsable del entorno
    And no veo contenido administrativo ni una opción de registro

  @wip
  Scenario Outline: 09-ADM Restringir el acceso a cuentas no administrativas
    Given que inicié sesión exitosamente en Auth0
    And mi cuenta de Lo Resuelvo es de <tipo>
    When entro al área de administración
    Then veo un mensaje que indica que el acceso está reservado a administradores
    And no veo contenido administrativo
    Examples:
      | tipo      |
      | cliente   |
      | prestador |

  @wip
  Scenario: 10-ADM No se puede verificar el acceso temporalmente
    Given que inicié sesión exitosamente en Auth0
    And el servicio de consulta de mi perfil no está disponible
    When entro al área de administración
    Then veo un mensaje que informa que no se pudo verificar mi acceso
    And veo la opción "Reintentar"
    And no se informa que mi cuenta no está habilitada
    And no veo contenido administrativo

  @wip
  Scenario: 11-ADM Reintentar la verificación de acceso
    Given que veo un error temporal al verificar mi acceso
    And el servicio de consulta de mi perfil vuelve a estar disponible
    And tengo una cuenta de administrador habilitada en Lo Resuelvo
    When hago clic en "Reintentar"
    Then accedo al área de administración con mi identidad verificada

  @wip
  Scenario Outline: 12-ADM Volver después de una autenticación incompleta
    Given que <resultado>
    When vuelvo a la aplicación
    Then no veo contenido administrativo
    And veo un mensaje que indica que no se completó el inicio de sesión
    And se me ofrece iniciar sesión nuevamente
    Examples:
      | resultado                                      |
      | cancelé el inicio de sesión                     |
      | ocurrió un error durante el inicio de sesión    |
      | no completé la verificación en dos pasos        |

  @wip
  Scenario: 13-ADM Acceder mediante teclado
    Given que estoy en la página de inicio
    And llegué al botón "Iniciar sesión" usando el teclado
    And puedo distinguir visualmente el botón enfocado
    When activo el botón con el teclado
    Then soy redirigido al portal de autenticación de Auth0
