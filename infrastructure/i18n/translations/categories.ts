export const categoriesTranslations = {
  title: "Catálogo de Rubros",
  columns: {
    id: "ID",
    name: "Nombre",
  },
  loading: "Cargando rubros...",
  empty: "No hay rubros registrados",
  error: "No se pudieron obtener los rubros",
  retry: "Reintentar",
  newCategory: "Nuevo rubro",
  createSuccess: "Rubro creado exitosamente",
  modal: {
    title: "Nuevo rubro",
    nameLabel: "Nombre del rubro",
    namePlaceholder: "Ej. Plomería",
    submitButton: "Crear rubro",
    submittingButton: "Creando rubro...",
    cancelButton: "Cancelar",
    closeAriaLabel: "Cerrar modal",
    errors: {
      nameRequired: "El nombre es obligatorio",
      duplicate: "El rubro ya existe",
      forbidden: "No tenés permisos para realizar esta acción",
    },
  },
} as const;
