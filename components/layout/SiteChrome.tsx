"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSiteControl } from "@/context/SiteControlContext";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const siteControl =
    useSiteControl();

  const isAdminPage =
    pathname.startsWith("/admin");

  /*
   * صفحات الإدارة لا يظهر فيها
   * Navbar أو Footer الخاص بالموقع.
   */
  if (isAdminPage) {
    return <>{children}</>;
  }

  const showFooter =
    siteControl?.footer_enabled !== false;

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>

      {showFooter && <Footer />}
    </>
  );
}