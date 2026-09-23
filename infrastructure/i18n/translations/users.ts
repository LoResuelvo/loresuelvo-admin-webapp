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
} as const;
