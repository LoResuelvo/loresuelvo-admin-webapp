import { authTranslations } from "./translations/auth";
import { navigationTranslations } from "./translations/navigation";

export const translations = {
  auth: authTranslations,
  navigation: navigationTranslations,
} as const;

