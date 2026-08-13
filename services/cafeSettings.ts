import { supabase } from "@/lib/supabase";

const TABLE = "cafe_settings";

export type CafeSettings = {
  id: string;
  cafe_name: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;

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
};

export async function getCafeSettings(): Promise<CafeSettings | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load cafe settings:", error);
    throw error;
  }

  return (data as CafeSettings | null) ?? null;
}

export async function updateCafeSettings(
  payload: Partial<CafeSettings>
): Promise<CafeSettings> {
  const existing = await getCafeSettings();

  if (!existing) {
    throw new Error("cafe_settings row not found");
  }

  const updatePayload: Partial<CafeSettings> = {};

  const updatableKeys: Array<keyof CafeSettings> = [
    "cafe_name",
    "is_open",
    "logo_url",
    "phone",
    "whatsapp",
    "address",
    "maps_url",
    "instagram_handle",
    "snapchat_handle",
    "tiktok_handle",
    "email",
    "facebook_url",
    "opening_hours",
    "description",
  ];

  for (const key of updatableKeys) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      const value = payload[key];

      if (value !== undefined) {
        updatePayload[key] = value as never;
      }
    }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update cafe settings:", error);
    throw error;
  }

  return data as CafeSettings;
}