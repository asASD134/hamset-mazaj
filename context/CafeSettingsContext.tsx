"use client";

import React, {
  createContext,
  useContext,
  useState,
} from "react";

const DEFAULT_NAME = "همسة مزاج";

export type CafeSettings = {
  id?: string;

  cafe_name: string;

  logo_url?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  maps_url?: string | null;
  instagram_handle?: string | null;
  snapchat_handle?: string | null;
  tiktok_handle?: string | null;
  email?: string | null;
  facebook_url?: string | null;
  opening_hours?: string | null;
  description?: string | null;

  is_open?: boolean | null;

  created_at?: string;
  updated_at?: string;
};

type CafeSettingsContextType = {
  settings: CafeSettings;
  setSettings: (patch: Partial<CafeSettings>) => void;
};

const DEFAULT_SETTINGS: CafeSettings = {
  cafe_name: DEFAULT_NAME,

  logo_url: "/images/logo.png",

  phone: null,
  whatsapp: null,
  address: null,
  maps_url: null,

  instagram_handle: null,
  snapchat_handle: null,
  tiktok_handle: null,

  email: null,
  facebook_url: null,

  opening_hours: "مفتوح 24 ساعة",

  description: null,

  is_open: true,
};

const CafeSettingsContext =
  createContext<CafeSettingsContextType>({
    settings: DEFAULT_SETTINGS,
    setSettings: () => {},
  });

export function CafeSettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings?: Partial<CafeSettings> | null;
  children: React.ReactNode;
}) {
  const [settings, setSettingsState] =
    useState<CafeSettings>({
      ...DEFAULT_SETTINGS,
      ...(initialSettings ?? {}),
    });

  function setSettings(
    patch: Partial<CafeSettings>
  ) {
    setSettingsState((current) => ({
      ...current,
      ...patch,
    }));
  }

  return (
    <CafeSettingsContext.Provider
      value={{
        settings,
        setSettings,
      }}
    >
      {children}
    </CafeSettingsContext.Provider>
  );
}

export function useCafeSettings() {
  return useContext(CafeSettingsContext);
}

export default CafeSettingsContext;