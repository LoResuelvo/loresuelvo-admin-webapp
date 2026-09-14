import { NextRequest, NextResponse } from "next/server";
import { getAuth0 } from "@/infrastructure/auth/auth0";
import { translations } from "@/infrastructure/i18n/translations";

export async function middleware(request: NextRequest) {
  try {
    return await getAuth0().middleware(request);
  } catch {
    if (request.nextUrl.pathname.startsWith("/auth/")) {
      return new NextResponse(translations.auth.unavailable, { status: 503 });
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
