Feature: Autenticación de Administrador
  Como administrador del sistema
  Quiero iniciar sesión en el panel de control
  Para gestionar usuarios y servicios

  Scenario: 01-ADM Login con credenciales válidas
    When inicio sesión como administrador
    Then veo el panel principal de administración

  @wip
  Scenario: 02-ADM Login con segundo factor
    When inicio sesión como administrador
    Then veo el panel principal de administración
