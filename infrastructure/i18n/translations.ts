import { authTranslations } from "./translations/auth";
import { categoriesTranslations } from "./translations/categories";
import { navigationTranslations } from "./translations/navigation";

export const translations = {
  auth: authTranslations,
  categories: categoriesTranslations,
  navigation: navigationTranslations,
} as const;

