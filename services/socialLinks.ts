import { supabase } from "@/lib/supabase";

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

async function getCafeSettingsId(): Promise<string> {
  const { data, error } = await supabase
    .from(CAFE_SETTINGS_TABLE)
    .select("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to load cafe settings id:",
      error
    );

    throw error;
  }

  if (!data?.id) {
    throw new Error(
      "cafe_settings row not found"
    );
  }

  return data.id;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const cafeSettingsId =
    await getCafeSettingsId();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq(
      "cafe_settings_id",
      cafeSettingsId
    )
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Failed to load social links:",
      error
    );

    throw error;
  }

  return (data ?? []) as SocialLink[];
}

export async function createSocialLink(
  payload: {
    name: string;
    url: string;
    icon?: string;
    is_active?: boolean;
    sort_order?: number;
  }
): Promise<SocialLink> {
  const cafeSettingsId =
    await getCafeSettingsId();

  const name = payload.name.trim();
  const url = payload.url.trim();

  if (!name) {
    throw new Error(
      "اسم موقع التواصل مطلوب"
    );
  }

  if (!url) {
    throw new Error(
      "رابط موقع التواصل مطلوب"
    );
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      cafe_settings_id:
        cafeSettingsId,

      name,

      url,

      icon:
        payload.icon?.trim() || "🔗",

      is_active:
        payload.is_active ?? true,

      sort_order:
        payload.sort_order ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    console.error(
      "Failed to create social link:",
      error
    );

    throw error;
  }

  return data as SocialLink;
}

export async function updateSocialLink(
  id: string,
  payload: Partial<{
    name: string;
    url: string;
    icon: string;
    is_active: boolean;
    sort_order: number;
  }>
): Promise<SocialLink> {
  const updatePayload: Record<
    string,
    unknown
  > = {};

  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "name"
    )
  ) {
    updatePayload.name =
      payload.name?.trim() ?? "";
  }

  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "url"
    )
  ) {
    updatePayload.url =
      payload.url?.trim() ?? "";
  }

  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "icon"
    )
  ) {
    updatePayload.icon =
      payload.icon?.trim() || "🔗";
  }

  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "is_active"
    )
  ) {
    updatePayload.is_active =
      payload.is_active;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "sort_order"
    )
  ) {
    updatePayload.sort_order =
      payload.sort_order;
  }

  if (
    "name" in updatePayload &&
    !String(updatePayload.name).trim()
  ) {
    throw new Error(
      "اسم موقع التواصل مطلوب"
    );
  }

  if (
    "url" in updatePayload &&
    !String(updatePayload.url).trim()
  ) {
    throw new Error(
      "رابط موقع التواصل مطلوب"
    );
  }

  const cafeSettingsId =
    await getCafeSettingsId();

  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq("id", id)
    .eq(
      "cafe_settings_id",
      cafeSettingsId
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Failed to update social link:",
      error
    );

    throw error;
  }

  return data as SocialLink;
}

export async function deleteSocialLink(
  id: string
): Promise<void> {
  const cafeSettingsId =
    await getCafeSettingsId();

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq(
      "cafe_settings_id",
      cafeSettingsId
    );

  if (error) {
    console.error(
      "Failed to delete social link:",
      error
    );

    throw error;
  }
}

export async function toggleSocialLink(
  id: string,
  isActive: boolean
): Promise<SocialLink> {
  return updateSocialLink(id, {
    is_active: isActive,
  });
}