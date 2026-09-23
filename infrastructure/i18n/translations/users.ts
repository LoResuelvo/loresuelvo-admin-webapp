export const usersTranslations = {
  title: "Directorio de Usuarios",
  tabs: {
    consumers: "Consumidores",
    providers: "Prestadores",
  },
  search: {
    label: "Buscar consumidores",
    placeholder: "Buscar por nombre, apellido o correo...",
  },
  table: {
    caption: "Listado de consumidores",
    columns: {
      photo: "Foto",
      name: "Nombre",
      surname: "Apellido",
      email: "Correo",
      createdOn: "Fecha de registro",
    },
  },
  loading: "Cargando consumidores...",
  empty: "No hay consumidores disponibles",
  forbidden: "Acceso restringido: no tenés permisos para consultar el directorio de consumidores",
  error: "No se pudieron obtener los consumidores. Intentá nuevamente más tarde",
  retry: "Reintentar",
  providers: {
    filters: {
      category: {
        label: "Filtrar por rubro",
        all: "Todos los rubros",
      },
      status: {
        label: "Filtrar por estado",
        all: "Todos los estados",
      },
    },
    search: {
      label: "Buscar prestadores",
      placeholder: "Buscar por nombre, apellido o correo...",
    },
    table: {
      caption: "Listado de prestadores",
      columns: {
        photo: "Foto",
        name: "Nombre",
        surname: "Apellido",
        email: "Correo",
        category: "Rubro",
        coverageZones: "Zonas de cobertura",
        verificationStatus: "Estado de verificación",
      },
    },
    status: {
      approved: "Verificado",
      in_review: "En revisión",
      declined: "Rechazado",
      unverified: "Sin verificar",
    },
    loading: "Cargando prestadores...",
    empty: "No hay prestadores disponibles",
    forbidden: "Acceso restringido: no tenés permisos para consultar el directorio de prestadores",
    error: "No se pudieron obtener los prestadores. Intentá nuevamente más tarde",
    retry: "Reintentar",
  },
} as const;
