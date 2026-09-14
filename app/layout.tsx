import type { Metadata } from "next";
import { translations } from "@/infrastructure/i18n/translations";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: translations.auth.pageTitle,
  description: translations.auth.pageDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
