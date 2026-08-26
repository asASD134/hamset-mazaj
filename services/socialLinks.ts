import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId, isPlatformSettingsClientMode } from "@/lib/cafe-context-client";

const TABLE = "social_links";
const CAFE_SETTINGS_TABLE = "cafe_settings";

export type SocialLink = {
  id: string;
  cafe_settings_id: string;
  name: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

async function getCafeSettingsId() {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(CAFE_SETTINGS_TABLE).select("id").eq("cafe_id", cafeId).single();
  if (error || !data?.id) throw error ?? new Error("cafe_settings row not found");
  return data.id;
}

async function callPlatformSocial(payload: Record<string, unknown> = {}) {
  const response = await fetch("/api/admin/platform-settings/apply-social-links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.error || "تعذر نشر مواقع التواصل.");
}

export async function getSocialLinks() {
  const id = await getCafeSettingsId();
  const { data, error } = await supabase.from(TABLE).select("*").eq("cafe_settings_id", id).eq("is_active", true).order("sort_order").order("created_at");
  if (error) throw error;
  return (data ?? []) as SocialLink[];
}

export async function createSocialLink(payload: { name: string; url: string; icon?: string; is_active?: boolean; sort_order?: number }) {
  if (isPlatformSettingsClientMode()) {
    await callPlatformSocial({ action: "create", link: payload });
    const links = await getSocialLinks();
    return links[links.length - 1] as SocialLink;
  }

  const cafeSettingsId = await getCafeSettingsId();
  const name = payload.name.trim();
  const url = payload.url.trim();
  if (!name || !url) throw new Error("اسم ورابط موقع التواصل مطلوبان");
  const { data, error } = await supabase.from(TABLE).insert({ cafe_settings_id: cafeSettingsId, name, url, icon: payload.icon?.trim() || "🔗", is_active: payload.is_active ?? true, sort_order: payload.sort_order ?? 0 }).select("*").single();
  if (error) throw error;
  return data as SocialLink;
}

export async function updateSocialLink(id: string, payload: Partial<{ name: string; url: string; icon: string; is_active: boolean; sort_order: number }>) {
  if (isPlatformSettingsClientMode()) {
    await callPlatformSocial({ action: "update", id, link: payload });
    const links = await getSocialLinks();
    return links.find((item) => item.id === id) ?? links[0];
  }

  const cafeSettingsId = await getCafeSettingsId();
  const updatePayload: Record<string, unknown> = {};
  for (const key of ["name", "url", "icon", "is_active", "sort_order"] as const) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) updatePayload[key] = payload[key];
  }
  const { data, error } = await supabase.from(TABLE).update(updatePayload).eq("id", id).eq("cafe_settings_id", cafeSettingsId).select("*").single();
  if (error) throw error;
  return data as SocialLink;
}

export async function deleteSocialLink(id: string) {
  if (isPlatformSettingsClientMode()) {
    await callPlatformSocial({ action: "delete", id });
    return;
  }
  const cafeSettingsId = await getCafeSettingsId();
  const { error } = await supabase.from(TABLE).delete().eq("id", id).eq("cafe_settings_id", cafeSettingsId);
  if (error) throw error;
}

export async function toggleSocialLink(id: string, isActive: boolean) {
  return updateSocialLink(id, { is_active: isActive });
}
