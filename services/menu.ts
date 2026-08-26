import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId, isPlatformSettingsClientMode } from "@/lib/cafe-context-client";
import { MenuItem, CreateMenuItem, UpdateMenuItem } from "@/types/menu";

const TABLE_NAME = "menu";
type MenuContext = { platform?: boolean };

function mapMenuItem(item: any): MenuItem {
  return {
    id: String(item.id),
    name: item.name_ar ?? "",
    description: item.description_ar ?? "",
    price: Number(item.price ?? 0),
    calories: item.calories == null ? null : Number(item.calories),
    image: item.image_url ?? "",
    category: String(item.category_id ?? ""),
    available: Boolean(item.is_available),
    featured: Boolean(item.is_featured),
    sort_order: Number(item.sort_order ?? 0),
    created_at: item.created_at ?? "",
  };
}

function shouldPublishToPlatform(context?: MenuContext) {
  return context?.platform === true || isPlatformSettingsClientMode();
}

async function callPlatformMenu(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/platform-settings/apply-menu", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.ok !== true) throw new Error(result?.error || "تعذر نشر تحديث المنيو.");
  return result;
}

export async function getMenuItems(_context?: MenuContext): Promise<MenuItem[]> {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("cafe_id", cafeId).order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapMenuItem);
}

export async function getMenuItem(id: string, _context?: MenuContext): Promise<MenuItem | null> {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).eq("cafe_id", cafeId).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return mapMenuItem(data);
}

export async function createMenuItem(item: CreateMenuItem, context?: MenuContext): Promise<MenuItem> {
  const name = item.name.trim();
  const description = item.description.trim();
  if (!name) throw new Error("اسم المنتج مطلوب");
  if (!item.category) throw new Error("يجب اختيار التصنيف");
  if (!Number.isFinite(item.price) || item.price < 0) throw new Error("السعر غير صحيح");

  if (shouldPublishToPlatform(context)) {
    await callPlatformMenu({ action: "create", item: { ...item, name, description, calories: item.calories ?? null } });
    const items = await getMenuItems(context);
    return items[items.length - 1];
  }

  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).insert({
    cafe_id: cafeId,
    category_id: item.category,
    name_ar: name,
    name_en: name,
    description_ar: description,
    description_en: description,
    price: item.price,
    calories: item.calories ?? null,
    image_url: item.image || null,
    is_available: item.available,
    is_featured: item.featured ?? false,
    sort_order: item.sort_order,
  }).select("*").single();
  if (error) throw error;
  return mapMenuItem(data);
}

export async function updateMenuItem(item: UpdateMenuItem, context?: MenuContext): Promise<MenuItem> {
  const name = item.name.trim();
  const description = item.description.trim();
  if (!name) throw new Error("اسم المنتج مطلوب");
  if (!item.category) throw new Error("يجب اختيار التصنيف");
  if (!Number.isFinite(item.price) || item.price < 0) throw new Error("السعر غير صحيح");

  if (shouldPublishToPlatform(context)) {
    await callPlatformMenu({ action: "update", id: item.id, item: { ...item, name, description, calories: item.calories ?? null } });
    const refreshed = await getMenuItems(context);
    const match = refreshed.find((entry) => entry.id === item.id) ?? refreshed[0];
    if (!match) throw new Error("تعذر العثور على المنتج بعد التحديث.");
    return match;
  }

  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from(TABLE_NAME).update({
    category_id: item.category,
    name_ar: name,
    name_en: name,
    description_ar: description,
    description_en: description,
    price: item.price,
    calories: item.calories ?? null,
    image_url: item.image || null,
    is_available: item.available,
    is_featured: item.featured ?? false,
    sort_order: item.sort_order,
  }).eq("id", item.id).eq("cafe_id", cafeId).select("*").single();
  if (error) throw error;
  return mapMenuItem(data);
}

export async function deleteMenuItem(id: string, context?: MenuContext): Promise<void> {
  if (shouldPublishToPlatform(context)) {
    await callPlatformMenu({ action: "delete", id });
    return;
  }
  const cafeId = await getClientCafeId();
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id).eq("cafe_id", cafeId);
  if (error) throw error;
}

export async function toggleMenuAvailability(id: string, available: boolean, context?: MenuContext): Promise<void> {
  if (shouldPublishToPlatform(context)) {
    await callPlatformMenu({ action: "toggle", id, available });
    return;
  }
  const cafeId = await getClientCafeId();
  const { error } = await supabase.from(TABLE_NAME).update({ is_available: available }).eq("id", id).eq("cafe_id", cafeId);
  if (error) throw error;
}
