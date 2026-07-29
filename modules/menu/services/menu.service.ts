import { supabase } from "@/lib/supabase";
import type { MenuCategory } from "../types/menu";

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (categoriesError || !categories) {
    console.log("Categories Error:", categoriesError);
    return [];
  }

  console.log("Categories:", categories);

  const { data: items, error: itemsError } = await supabase
    .from("menu")
    .select("*")
    .eq("is_available", true)
    .order("sort_order");

  if (itemsError || !items) {
    console.log("Items Error:", itemsError);
    return [];
  }

  console.log("Items:", items);

  return categories.map((category) => ({
    id: String(category.id),
    title: category.name_ar,
    items: items
      .filter((item) => Number(item.category_id) === Number(category.id))
      .map((item) => ({
        id: String(item.id),
        name: item.name_ar,
        description: item.description_ar ?? "",
        price: item.price,
        image: item.image_url ?? "",
        icon: "☕",
        featured: item.is_featured,
      })),
  }));
}