import { getActiveCafeServer } from "@/lib/cafe-context-server";
import { createClient } from "@/lib/supabase/server";

export type CafeSettingsServer = {
  id?: string;
  cafe_id?: string;
  cafe_slug?: string;
  cafe_name?: string | null;
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

const DEFAULT_SETTINGS: CafeSettingsServer = {
  cafe_name: "همسة مزاج",
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

export default async function getCafeSettings(
  requestedCafe?: string | null
): Promise<CafeSettingsServer> {
  try {
    const activeCafe = await getActiveCafeServer(requestedCafe);

    if (!activeCafe) return DEFAULT_SETTINGS;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cafe_settings")
      .select("*")
      .eq("cafe_id", activeCafe.id)
      .maybeSingle();

    if (error || !data) {
      return {
        ...DEFAULT_SETTINGS,
        cafe_id: activeCafe.id,
        cafe_slug: activeCafe.slug,
        cafe_name: activeCafe.name,
      };
    }

    return {
      ...DEFAULT_SETTINGS,
      ...(data as CafeSettingsServer),
      cafe_slug: activeCafe.slug,
      cafe_id: activeCafe.id,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
