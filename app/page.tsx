import { LoginEntry } from "@/components/auth/login-entry";
import { translations } from "@/infrastructure/i18n/translations";

type HomeProps = { searchParams: Promise<{ auth?: string | string[] }> };

export default async function Home({ searchParams }: HomeProps) {
  const { auth } = await searchParams;
  const notice = auth === "incomplete" ? translations.auth.incomplete : undefined;
  return <LoginEntry notice={notice} />;
}
