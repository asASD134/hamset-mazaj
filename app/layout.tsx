import type { Metadata } from "next";
import { headers } from "next/headers";

import "./globals.css";

import getCafeSettings from "@/lib/getCafeSettings";
import { getSiteControl } from "@/lib/getSiteControl";
import { getActiveCafeServer } from "@/lib/cafe-context-server";
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

async function isPlatformPreviewRequest() {
  return (await getRequestPath()) === "/platform-preview";
}

export async function generateMetadata(): Promise<Metadata> {
  if (await isAdminOrLoginRequest()) {
    return { title: "همسة مزاج - الإدارة", description: "لوحة إدارة همسة مزاج." };
  }
  if (await isPlatformPreviewRequest()) {
    return { title: "معاينة المنصة - همسة مزاج", description: "معاينة فعلية لأساسيات المنصة العامة." };
  }

  const cafe = await getActiveCafeServer(null, { includeInactive: true });
  if (cafe && !cafe.is_active) {
    return { title: `${cafe.name} - متوقف مؤقتًا`, description: `${cafe.name} متوقف مؤقتًا حاليًا.` };
  }

  const settings = await getCafeSettings();
  const cafeName = settings?.cafe_name || cafe?.name || "همسة مزاج";
  const description = settings?.description || `${cafeName} - مقهى وجلسات راقية وتجربة مميزة.`;
  return { title: cafeName, description };
}

function InactiveCafePage({ cafeName }: { cafeName: string }) {
  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
      <div className="w-full max-w-2xl rounded-[2rem] border border-yellow-500/20 bg-[#121212] p-8 text-center shadow-2xl sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-500/10 text-4xl">⏸️</div>
        <h1 className="text-3xl font-black text-yellow-400 sm:text-4xl">{cafeName}</h1>
        <h2 className="mt-5 text-2xl font-black text-white">الموقع متوقف مؤقتًا</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
          هذا المقهى متوقف حاليًا من الإدارة، لذلك تم إخفاء محتوى الموقع والمباريات والإعدادات إلى أن يتم تشغيله مرة أخرى.
        </p>
      </div>
    </div>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  if (await isAdminOrLoginRequest()) {
    return (
      <html lang="ar" dir="rtl">
        <body className="bg-[#050505] text-white">{children}</body>
      </html>
    );
  }

  const platformPreview = await isPlatformPreviewRequest();
  const activeCafe = await getActiveCafeServer(null, { includeInactive: true });

  if (activeCafe && !activeCafe.is_active && !platformPreview) {
    return (
      <html lang="ar" dir="rtl">
        <body className="bg-[#050505] text-white"><InactiveCafePage cafeName={activeCafe.name} /></body>
      </html>
    );
  }

  const [settings, siteControl] = await Promise.all([
    getCafeSettings(),
    getSiteControl(),
  ]);

  let previewSettings = settings;
  let previewSiteControl = siteControl;

  if (platformPreview) {
    previewSettings = settings;
    if (previewSiteControl) {
      previewSiteControl = { ...previewSiteControl };
    }
  }

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050505] text-white">
        <PublicShell settings={previewSettings} siteControl={previewSiteControl}>
          {children}
        </PublicShell>
      </body>
    </html>
  );
}