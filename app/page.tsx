import { redirect } from "next/navigation";
import { LoginEntry } from "@/components/auth/login-entry";
import { getAuth0 } from "@/infrastructure/auth/auth0";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";
import { getSafeReturnToPath } from "@/lib/safe-return-to";

type HomeProps = {
  searchParams: Promise<{ auth?: string | string[]; returnTo?: string | string[] }>;
};

async function readSession() {
  try {
    return { session: await getAuth0().getSession(), unavailable: false };
  } catch {
    return { session: null, unavailable: true };
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const { auth, returnTo: requestedReturnTo } = await searchParams;
  const { session, unavailable } = await readSession();
  const returnTo = typeof requestedReturnTo === "string"
    ? getSafeReturnToPath(requestedReturnTo, process.env.APP_URL ?? "http://localhost")
    : null;

  if (session && auth !== "incomplete") {
    redirect(returnTo ?? ROUTES.operations);
  }

  const notice = unavailable
    ? translations.auth.unavailable
    : auth === "incomplete" ? translations.auth.incomplete : undefined;
  return <LoginEntry notice={notice} returnTo={returnTo ?? undefined} />;
}
