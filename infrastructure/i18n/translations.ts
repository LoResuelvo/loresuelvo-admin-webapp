import { authTranslations } from "./translations/auth";
import { categoriesTranslations } from "./translations/categories";
import { navigationTranslations } from "./translations/navigation";
import { usersTranslations } from "./translations/users";

export const translations = {
  auth: authTranslations,
  categories: categoriesTranslations,
  navigation: navigationTranslations,
  users: usersTranslations,
} as const;

