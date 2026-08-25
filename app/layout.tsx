import type { Metadata } from "next";
import { headers } from "next/headers";

import "./globals.css";

import getCafeSettings from "@/lib/getCafeSettings";
import { getSiteControl } from "@/lib/getSiteControl";
import { getActiveCafeServer } from "@/lib/cafe-context-server";
import { getPlatformSettings } from "@/services/platformSettings";
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

// Only these fields are true platform-wide controls.
// All manually-written content remains owned by each individual cafe/site.
const GLOBAL_KEYS = [
  "primary_color", "background_color", "surface_color", "typography",
  "hero_enabled",
  "featured_enabled", "featured_limit",
  "why_enabled",
  "matches_enabled",
  "gallery_enabled",
  "testimonials_enabled",
  "contact_enabled",
  "footer_enabled",
  "show_phone", "show_address", "show_opening_hours", "show_social_links", "show_map",
  "section_order",
  "show_site_name", "show_tagline", "show_site_description", "show_logo",
  "show_hero_badge", "show_hero_title", "show_hero_subtitle", "show_hero_description", "show_hero_primary_button", "show_hero_secondary_button",
  "show_featured_badge", "show_featured_title", "show_featured_description", "show_featured_products", "show_featured_prices", "show_featured_button",
  "show_why_title", "show_why_description", "show_why_features",
  "show_matches_title", "show_matches_description", "show_matches_list", "show_matches_button",
  "show_gallery_title", "show_gallery_description", "show_gallery_images", "show_gallery_button",
  "show_testimonials_title", "show_testimonials_description", "show_testimonials_list",
  "show_contact_title", "show_contact_description", "show_contact_address", "show_contact_phone", "show_contact_hours", "show_contact_map", "show_contact_social_links",
  "show_footer_description", "show_footer_links", "show_footer_contact", "show_footer_social_links", "show_footer_copyright",
] as const;

function applyPlatformFoundation(siteControl: any, foundation: Record<string, any>) {
  const merged = { ...siteControl };
  for (const key of GLOBAL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(foundation, key)) merged[key] = foundation[key];
  }
  return merged;
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

  const [settings, siteControl, platform] = await Promise.all([
    getCafeSettings(),
    getSiteControl(),
    getPlatformSettings(),
  ]);

  let mergedSiteControl = siteControl ? applyPlatformFoundation(siteControl, platform.foundation || {}) : siteControl;
  let previewSettings = settings;

  if (platformPreview) {
    const preview = platform.preview_assets || {};
    previewSettings = settings ? { ...settings, logo_url: preview.logo || settings.logo_url } : settings;
    if (mergedSiteControl) {
      mergedSiteControl = {
        ...mergedSiteControl,
        hero_background_url: preview.hero || mergedSiteControl.hero_background_url,
        gallery_images: preview.gallery ? [preview.gallery] : mergedSiteControl.gallery_images,
        gallery_images_visible: preview.gallery ? [true] : mergedSiteControl.gallery_images_visible,
        gallery_images_home: preview.gallery ? [true] : mergedSiteControl.gallery_images_home,
      };
    }
  }

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050505] text-white">
        <PublicShell settings={previewSettings} siteControl={mergedSiteControl}>
          {children}
        </PublicShell>
      </body>
    </html>
  );
}
