export const categoriesTranslations = {
  title: "Catálogo de Rubros",
  columns: {
    id: "ID",
    name: "Nombre",
    status: "Estado",
  },
  status: {
    label: "Estado",
    active: "Activo",
    inactive: "Inactivo",
  },
  actions: {
    edit: "Editar",
    deactivate: "Desactivar",
  },
  loading: "Cargando rubros...",
  empty: "No hay rubros registrados",
  error: "No se pudieron obtener los rubros",
  retry: "Reintentar",
  newCategory: "Nuevo rubro",
  createSuccess: "Rubro creado exitosamente",
  updateSuccess: "Rubro actualizado exitosamente",
  deactivateSuccess: "Rubro desactivado exitosamente",
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
      conflict: "El rubro cambió desde que lo cargaste. Actualizá el catálogo e intentá nuevamente",
      versionRequired: "No se pudo obtener la versión actual del rubro. Actualizá el catálogo e intentá nuevamente.",
      forbidden: "No tenés permisos para realizar esta acción",
      serverError: "No se pudo crear el rubro. Intentá nuevamente más tarde",
    },
  },
  editModal: {
    title: "Editar rubro",
    nameLabel: "Nombre del rubro",
    namePlaceholder: "Ej. Plomería",
    submitButton: "Guardar cambios",
    submittingButton: "Guardando cambios...",
    cancelButton: "Cancelar",
    closeAriaLabel: "Cerrar modal de edición",
    errors: {
      nameRequired: "El nombre es obligatorio",
      conflict: "El rubro cambió desde que lo cargaste. Actualizá el catálogo e intentá nuevamente.",
      duplicate: "El rubro ya existe",
      versionRequired: "No se pudo obtener la versión actual del rubro. Actualizá el catálogo e intentá nuevamente.",
      forbidden: "No tenés permisos para realizar esta acción",
      serverError: "No se pudo actualizar el rubro. Intentá nuevamente más tarde",
    },
  },
  deactivateModal: {
    title: "Desactivar rubro",
    loading: "Evaluando impacto en prestadores y órdenes...",
    impactNotice: (providers: number) =>
      providers === 1
        ? "Existe 1 prestador con este rubro asignado que dejará de recibir solicitudes."
        : `Existen ${providers} prestadores con este rubro asignado que dejarán de recibir solicitudes.`,
    noProvidersNotice: "No hay prestadores asignados a este rubro.",
    ongoingOrdersWarning: (orders: number) =>
      `Hay ${orders} ${orders === 1 ? "orden" : "órdenes"} programadas o pendientes de pago. Si confirmás, esas operaciones existentes podrán continuar.`,
    confirmationLabel: "Confirmo la desactivación aunque existan órdenes en curso",
    versionRequired: "No se pudo obtener la versión actual del rubro. Actualizá el catálogo e intentá nuevamente.",
    confirmButton: "Confirmar desactivación",
    confirmingButton: "Desactivando...",
    cancelButton: "Cancelar",
    closeAriaLabel: "Cerrar diálogo",
    errors: {
      forbidden: "No tenés permisos para realizar esta acción",
      confirmationRequired: "Confirmá la desactivación de las operaciones en curso para continuar.",
      conflict: "El rubro cambió desde que lo cargaste. Actualizá el catálogo e intentá nuevamente.",
      invalid: "Revisá el motivo y los datos de la desactivación.",
      serverError: "No se pudo desactivar el rubro. Intentá nuevamente más tarde",
    },
  },
} as const;

