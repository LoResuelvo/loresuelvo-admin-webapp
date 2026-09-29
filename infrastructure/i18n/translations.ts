import { auditTranslations } from "./translations/audit";
import { authTranslations } from "./translations/auth";
import { categoriesTranslations } from "./translations/categories";
import { claimsTranslations } from "./translations/claims";
import { metricsTranslations } from "./translations/metrics";
import { navigationTranslations } from "./translations/navigation";
import { operationsTranslations } from "./translations/operations";
import { paymentsTranslations } from "./translations/payments";
import { usersTranslations } from "./translations/users";

export const translations = {
  audit: auditTranslations,
  auth: authTranslations,
  categories: categoriesTranslations,
  claims: claimsTranslations,
  metrics: metricsTranslations,
  navigation: navigationTranslations,
  operations: operationsTranslations,
  payments: paymentsTranslations,
  users: usersTranslations,
} as const;

