"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getSiteControl,
  type SiteControl,
} from "@/services/siteControl";

type SiteControlContextValue =
  SiteControl | null;

const SiteControlContext =
  createContext<SiteControlContextValue>(
    null
  );

export function SiteControlProvider({
  children,
  initialSettings = null,
}: {
  children: React.ReactNode;
  initialSettings?: SiteControl | null;
}) {
  const [settings, setSettings] =
    useState<SiteControl | null>(
      initialSettings
    );

  useEffect(() => {
    /*
     * إذا كانت الإعدادات وصلت من RootLayout
     * فلا نحتاج طلبًا إضافيًا.
     */
    if (initialSettings) {
      setSettings(initialSettings);
      return;
    }

    let mounted = true;

    async function loadSettings() {
      try {
        const data =
          await getSiteControl();

        if (!mounted) {
          return;
        }

        setSettings(data);
      } catch (error) {
        console.error(
          "Failed to load site control:",
          error
        );
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [initialSettings]);

  return (
    <SiteControlContext.Provider
      value={settings}
    >
      {children}
    </SiteControlContext.Provider>
  );
}

export function useSiteControl() {
  return useContext(
    SiteControlContext
  );
}