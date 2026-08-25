"use client";

import { CartProvider } from "@/context/CartContext";
import { TableProvider } from "@/context/TableContext";
import { CafeSettingsProvider } from "@/context/CafeSettingsContext";
import { SiteControlProvider } from "@/context/SiteControlContext";
import SiteChrome from "@/components/layout/SiteChrome";
import type { ReactNode } from "react";
import type { CafeSettingsServer } from "@/lib/getCafeSettings";
import type { SiteControl } from "@/services/siteControl";

export default function PublicShell({
  children,
  settings,
  siteControl,
}: {
  children: ReactNode;
  settings: CafeSettingsServer | null;
  siteControl: SiteControl | null;
}) {
  return (
    <CafeSettingsProvider initialSettings={settings}>
      <SiteControlProvider initialSettings={siteControl}>
        <TableProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </TableProvider>
      </SiteControlProvider>
    </CafeSettingsProvider>
  );
}
