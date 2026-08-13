import React from "react";
import { CafeSettingsProvider } from "@/context/CafeSettingsContext";
import getCafeSettings from "@/lib/getCafeSettings";

export default async function CafeSettingsProviderServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getCafeSettings();

  return (
    <CafeSettingsProvider initialSettings={settings}>
      {children}
    </CafeSettingsProvider>
  );
}