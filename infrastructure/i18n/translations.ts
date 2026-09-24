import { authTranslations } from "./translations/auth";
import { categoriesTranslations } from "./translations/categories";
import { navigationTranslations } from "./translations/navigation";
import { operationsTranslations } from "./translations/operations";
import { paymentsTranslations } from "./translations/payments";
import { usersTranslations } from "./translations/users";

export const translations = {
  auth: authTranslations,
  categories: categoriesTranslations,
  navigation: navigationTranslations,
  operations: operationsTranslations,
  payments: paymentsTranslations,
  users: usersTranslations,
} as const;

