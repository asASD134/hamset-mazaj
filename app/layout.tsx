import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { CartProvider } from "@/context/CartContext";
import { TableProvider } from "@/context/TableContext";

import { CafeSettingsProvider } from "@/context/CafeSettingsContext";
import getCafeSettings from "@/lib/getCafeSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCafeSettings();

  const cafeName =
    settings.cafe_name || "همسة مزاج";

  const description =
    settings.description ||
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
  const settings = await getCafeSettings();

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050505] text-white">
        <CafeSettingsProvider
          initialSettings={settings}
        >
          <TableProvider>
            <CartProvider>
              <Navbar />

              {children}

              <Footer />
            </CartProvider>
          </TableProvider>
        </CafeSettingsProvider>
      </body>
    </html>
  );
}