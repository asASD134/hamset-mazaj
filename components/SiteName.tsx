"use client";

import { useCafeSettings } from "@/context/CafeSettingsContext";

export default function SiteName() {
  const { settings } = useCafeSettings();

  return <>{settings.cafe_name || "همسة مزاج"}</>;
}