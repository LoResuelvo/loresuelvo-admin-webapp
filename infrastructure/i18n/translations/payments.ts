export const paymentsTranslations = {
  title: "Consola de Pagos",
  subtitle: "Auditoría de cobros, señas, saldos y retenciones del marketplace",
  table: {
    reference: "Referencia / ID",
    purpose: "Propósito",
    consumer: "Cliente",
    provider: "Prestador",
    total: "Total",
    sellerNet: "Neto prestador",
    platformFee: "Comisión plataforma",
    status: "Estado",
    date: "Fecha",
  },
  purposes: {
    deposit: "Seña",
    balance: "Saldo",
  },
  statuses: {
    approved: "Aprobado",
    pending: "Pendiente",
    rejected: "Rechazado",
    cancelled: "Cancelado",
  },
  checkout: {
    pendingNotice: "Pendiente de cobro",
    notAccredited: "No computado como cobro acreditado",
  },
  loading: "Cargando pagos...",
  empty: "No hay transacciones disponibles",
  error: "Ocurrió un error al cargar los pagos",
  retry: "Reintentar",
  forbidden: "No posees permisos para consultar información financiera",
} as const;
