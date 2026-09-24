export const ROUTES = {
  admin: "/admin",
  adminAccess: "/api/admin/access",
  home: "/",
  signIn: "/auth/login",
  users: "/usuarios",
  providerDetail: (id: string | number) => `/usuarios/prestadores/${id}`,
  categories: "/rubros",
  operations: "/operaciones",
  operationDetail: (id: string | number) => `/operaciones/${id}`,
  payments: "/pagos",
  logout: "/auth/logout",
} as const;

