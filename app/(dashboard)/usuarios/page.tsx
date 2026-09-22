import { translations } from "@/infrastructure/i18n/translations";

export default function UsersPage() {
  return (
    <section aria-label={translations.navigation.users} className="max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
        {translations.navigation.users}
      </h1>
    </section>
  );
}
