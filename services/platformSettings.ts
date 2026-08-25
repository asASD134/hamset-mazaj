import { createClient } from "@/lib/supabase/server";

export type PlatformSettings = {
  id: string;
  singleton: boolean;
  primary_color: string;
  background_color: string;
  surface_color: string;
  global_typography: Record<string, unknown>;
  updated_at: string;
};

const DEFAULTS = {
  primary_color: "#EAB308",
  background_color: "#0A0A0A",
  surface_color: "#121212",
  global_typography: {},
} as const;

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (error || !data) {
    return {
      id: "",
      singleton: true,
      ...DEFAULTS,
      updated_at: new Date().toISOString(),
    };
  }

  return {
    ...DEFAULTS,
    ...(data as PlatformSettings),
  };
}
