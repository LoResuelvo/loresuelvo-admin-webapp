Feature: Layout de navegación y cierre de sesión
  Como administrador autenticado de LoResuelvo
  quiero contar con un layout de navegación y cerrar mi sesión
  para navegar entre módulos de gestión y finalizar mi acceso de forma segura

  @wip
  Scenario: 01-NAV Mostrar el layout de administración con identidad del administrador
    Given que estoy autenticado como administrador con nombre "Ana", apellido "Pérez" y correo "ana@example.com"
    When ingreso al área de administración
    Then veo la identidad "Lo Resuelvo" y el indicador "Administración"
    And veo mi nombre "Ana", apellido "Pérez" y correo "ana@example.com"
    And veo los enlaces de navegación "Directorio de Usuarios" y "Catálogo de Rubros"

  @wip
  Scenario: 02-NAV Navegar entre secciones del panel con indicador de ruta activa
    Given que estoy autenticado como administrador
    And estoy en el área de administración
    When navego a la sección "Catálogo de Rubros"
    Then accedo a la sección de rubros
    And el enlace "Catálogo de Rubros" se muestra como ruta activa

  @wip
  Scenario: 03-NAV Cerrar sesión y denegar acceso posterior
    Given que estoy autenticado como administrador
    And estoy en el área de administración
    When hago clic en "Cerrar sesión"
    Then soy redirigido a la página de bienvenida pública
    And si intento ingresar nuevamente al área de administración se me deniega el acceso

  @wip
  Scenario: 04-NAV Navegar mediante el menú colapsable en pantallas pequeñas
    Given que estoy autenticado como administrador
    And estoy en el área de administración en una pantalla móvil
    When abro el menú de navegación
    Then veo los enlaces de navegación y la opción "Cerrar sesión"
    And puedo cerrar el menú colapsable
