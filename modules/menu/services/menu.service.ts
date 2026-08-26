import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";
import type { MenuCategory } from "../types/menu";

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const cafeId = await getClientCafeId();
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .eq("cafe_id", cafeId)
    .eq("is_active", true)
    .order("sort_order");
  if (categoriesError || !categories) return [];

  const { data: items, error: itemsError } = await supabase
    .from("menu")
    .select("*")
    .eq("cafe_id", cafeId)
    .eq("is_available", true)
    .order("sort_order");
  if (itemsError || !items) return [];

  return categories.map((category) => ({
    id: String(category.id),
    title: category.name_ar,
    items: items.filter((item) => Number(item.category_id) === Number(category.id)).map((item) => ({
      id: String(item.id),
      name: item.name_ar,
      description: item.description_ar ?? "",
      price: item.price,
      calories: item.calories == null ? null : Number(item.calories),
      image: item.image_url ?? "",
      icon: "☕",
      featured: item.is_featured,
    })),
  }));
}
