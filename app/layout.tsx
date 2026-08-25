import type { Metadata } from "next";

import "./globals.css";

import SiteChrome from "@/components/layout/SiteChrome";

import { CartProvider } from "@/context/CartContext";
import { TableProvider } from "@/context/TableContext";

import { CafeSettingsProvider } from "@/context/CafeSettingsContext";
import { SiteControlProvider } from "@/context/SiteControlContext";

import getCafeSettings from "@/lib/getCafeSettings";
import { getSiteControl } from "@/lib/getSiteControl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCafeSettings();

  const cafeName =
    settings?.cafe_name ||
    "همسة مزاج";

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
  const [settings, siteControl] =
    await Promise.all([
      getCafeSettings(),
      getSiteControl(),
    ]);

  return (
    <html
      lang="ar"
      dir="rtl"
    >
      <body className="bg-[#050505] text-white">
        <CafeSettingsProvider
          initialSettings={settings}
        >
          <SiteControlProvider
            initialSettings={
              siteControl
            }
          >
            <TableProvider>
              <CartProvider>
                <SiteChrome>
                  {children}
                </SiteChrome>
              </CartProvider>
            </TableProvider>
          </SiteControlProvider>
        </CafeSettingsProvider>
      </body>
    </html>
  );
}