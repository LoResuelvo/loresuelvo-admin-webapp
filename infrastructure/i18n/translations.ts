import { authTranslations } from "./translations/auth";
import { categoriesTranslations } from "./translations/categories";
import { metricsTranslations } from "./translations/metrics";
import { navigationTranslations } from "./translations/navigation";
import { operationsTranslations } from "./translations/operations";
import { paymentsTranslations } from "./translations/payments";
import { usersTranslations } from "./translations/users";

export const translations = {
  auth: authTranslations,
  categories: categoriesTranslations,
  metrics: metricsTranslations,
  navigation: navigationTranslations,
  operations: operationsTranslations,
  payments: paymentsTranslations,
  users: usersTranslations,
} as const;

