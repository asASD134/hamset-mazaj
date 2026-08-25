import type { Metadata } from "next";
import { headers } from "next/headers";

import "./globals.css";

import getCafeSettings from "@/lib/getCafeSettings";
import { getSiteControl } from "@/lib/getSiteControl";
import PublicShell from "@/components/layout/PublicShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REQUEST_PATH_HEADER = "x-request-pathname";

async function getRequestPath() {
  const headerStore = await headers();
  return headerStore.get(REQUEST_PATH_HEADER) || "/";
}

async function isAdminOrLoginRequest() {
  const pathname = await getRequestPath();
  return pathname.startsWith("/admin") || pathname === "/login";
}

export async function generateMetadata(): Promise<Metadata> {
  if (await isAdminOrLoginRequest()) {
    return {
      title: "همسة مزاج - الإدارة",
      description: "لوحة إدارة همسة مزاج.",
    };
  }

  const settings = await getCafeSettings();
  const cafeName = settings?.cafe_name || "همسة مزاج";
  const description =
    settings?.description ||
    `${cafeName} - مقهى وجلسات راقية وتجربة مميزة.`;

  return {
    title: cafeName,
    description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isAdminOrLoginRequest()) {
    return (
      <html lang="ar" dir="rtl">
        <body className="bg-[#050505] text-white">{children}</body>
      </html>
    );
  }

  const [settings, siteControl] = await Promise.all([
    getCafeSettings(),
    getSiteControl(),
  ]);

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050505] text-white">
        <PublicShell settings={settings} siteControl={siteControl}>
          {children}
        </PublicShell>
      </body>
    </html>
  );
}
