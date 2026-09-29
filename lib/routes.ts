export const ROUTES = {
  admin: "/admin",
  adminAccess: "/api/admin/access",
  home: "/",
  signIn: "/auth/login",
  users: "/usuarios",
  consumerDetail: (id: string | number) => `/usuarios/consumidores/${id}`,
  providerDetail: (id: string | number) => `/usuarios/prestadores/${id}`,
  categories: "/rubros",
  operations: "/operaciones",
  operationDetail: (id: string | number) => `/operaciones/${id}`,
  payments: "/pagos",
  metrics: "/metricas",
  claims: "/reclamos",
  claimDetail: (id: string | number) => `/reclamos/${id}`,
  logout: "/auth/logout",
} as const;

