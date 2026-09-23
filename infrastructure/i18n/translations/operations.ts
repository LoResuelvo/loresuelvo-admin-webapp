export const operationsTranslations = {
  title: "Bandeja de Operaciones",
  subtitle: "Monitoreo transversal de contrataciones y cuellos de botella",
  detail: {
    title: "Ficha de Operación",
    subtitle: "Detalle completo del servicio",
    backToList: "Volver a la bandeja",
  },
  table: {

    caption: "Bandeja de operaciones",
    columns: {
      consumer: "Cliente",
      provider: "Prestador",
      category: "Rubro",
      status: "Estado",
      bottleneck: "Alerta Operativa",
      responsible: "Responsable",
    },
  },
  status: {
    requested: "Solicitado",
    quoted: "Cotizado",
    in_progress: "En progreso",
    completed: "Completado",
    cancelled: "Cancelado",
  },
  bottleneck: {
    pending_proposal_24h: "Propuesta demorada > 24h",
    pending_booking_deposit: "Pago de seña pendiente",
    scheduled_today: "Agendado para hoy",
    delayed_service: "Servicio demorado",
    pending_final_payment: "Pago final pendiente",
    stalled: "Estancada > 24h",
    none: "Al día",
  },
  responsible: {
    consumer: "Cliente",
    provider: "Prestador",
    platform: "Plataforma",
    none: "—",
  },
  filters: {
    bottleneck: {
      label: "Alerta Operativa",
      all: "Todas las alertas",
    },
    category: {
      label: "Rubro",
      all: "Todos los rubros",
    },
    search: {
      label: "Buscar participante",
      placeholder: "Buscar por cliente o prestador...",
    },
  },
  loading: "Cargando operaciones...",
  empty: {
    title: "No se encontraron operaciones disponibles",
    message: "No existen contrataciones registradas o que coincidan con los criterios seleccionados.",
  },
  error: "Ocurrió un error al cargar las operaciones. Por favor intente nuevamente.",
  retry: "Reintentar",
  forbidden: "Acceso restringido. No tienes permisos para acceder al Centro de Operaciones.",
} as const;

