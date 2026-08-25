import { headers } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase-server";

const DEFAULT_NAME = "همسة مزاج";
const DEFAULT_SLUG = "hamset-mazaj";

export type CafeSettingsServer = {
  id?: string;
  cafe_id?: string | null;
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

export default async function getCafeSettings(): Promise<CafeSettingsServer> {
  try {
    const supabase = await createServerClient();
    const requestHeaders = await headers();
    const slug = requestHeaders.get("x-cafe-slug")?.trim() || DEFAULT_SLUG;

    const { data: cafe, error: cafeError } = await supabase
      .from("cafes")
      .select("id,name,slug,is_active")
      .eq("slug", slug)
      .maybeSingle();

    if (cafeError || !cafe) {
      if (cafeError) console.error("Failed to load cafe:", cafeError);
      return DEFAULT_SETTINGS;
    }

    const { data, error } = await supabase
      .from("cafe_settings")
      .select("*")
      .eq("cafe_id", cafe.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load cafe settings:", error);
      return DEFAULT_SETTINGS;
    }

    if (!data) {
      return {
        ...DEFAULT_SETTINGS,
        cafe_id: cafe.id,
        cafe_name: cafe.name,
      };
    }

    return {
      ...DEFAULT_SETTINGS,
      ...(data as CafeSettingsServer),
      cafe_id: cafe.id,
      cafe_name: data.cafe_name || cafe.name,
    };
  } catch (error) {
    console.error("Unexpected error loading cafe settings:", error);
    return DEFAULT_SETTINGS;
  }
}
