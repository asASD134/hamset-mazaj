import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId, isPlatformSettingsClientMode } from "@/lib/cafe-context-client";

const TABLE = "cafe_settings";

export type CafeSettings = {
  id: string;
  cafe_id: string;
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

const UPDATE_KEYS: Array<keyof CafeSettings> = [
  "cafe_name", "is_open", "logo_url", "phone", "whatsapp", "address", "maps_url",
  "instagram_handle", "snapchat_handle", "tiktok_handle", "email", "facebook_url",
  "opening_hours", "description",
];

export async function getCafeSettings(): Promise<CafeSettings | null> {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE).select("*").eq("cafe_id", cafeId).maybeSingle();
  if (error) throw error;
  return (data as CafeSettings | null) ?? null;
}

export async function updateCafeSettings(payload: Partial<CafeSettings>): Promise<CafeSettings> {
  if (isPlatformSettingsClientMode()) {
    const updatePayload: Record<string, unknown> = {};
    for (const key of UPDATE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined) {
        updatePayload[key] = payload[key];
      }
    }

    const response = await fetch("/api/admin/platform-settings/apply-cafe-settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cafeSettings: updatePayload }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.error || "تعذر نشر تحديث بيانات المقهى.");

    const refreshed = await getCafeSettings();
    if (!refreshed) throw new Error("cafe_settings row not found");
    return refreshed;
  }

  const cafeId = await getClientCafeId();
  const updatePayload: Record<string, unknown> = {};

  for (const key of UPDATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined) {
      updatePayload[key] = payload[key];
    }
  }

  const { data, error } = await supabase.from(TABLE).update(updatePayload).eq("cafe_id", cafeId).select("*").single();
  if (error) throw error;
  return data as CafeSettings;
}
