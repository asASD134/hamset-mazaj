import { supabase } from "@/lib/supabase";
import {
  MenuItem,
  CreateMenuItem,
  UpdateMenuItem,
} from "@/types/menu";

const TABLE_NAME = "menu";

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as any[]).map((item) => ({
    ...item,
    available: item.is_available,
    image: item.image_url,
    category: item.category_id,
    price: Number(item.price),
  })) as MenuItem[];
}

export async function getMenuItem(
  id: string
): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  return {
    ...data,
    available: data.is_available,
    image: data.image_url,
    category: data.category_id,
    price: Number(data.price),
  } as MenuItem;
}

export async function createMenuItem(
  item: CreateMenuItem
): Promise<MenuItem> {
  const payload = {
    name_ar: item.name,
    price: item.price,
    image_url: item.image,
    category_id: item.category,
    is_available: item.available,
    description: item.description,
    sort_order: item.sort_order,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return data as MenuItem;
}

export async function updateMenuItem(
  item: UpdateMenuItem
): Promise<MenuItem> {
  const { id, ...values } = item;

  const payload = {
    name_ar: values.name,
    price: values.price,
    image_url: values.image,
    category_id: values.category,
    is_available: values.available,
    description: values.description,
    sort_order: values.sort_order,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as MenuItem;
}

export async function deleteMenuItem(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function toggleMenuAvailability(
  id: string,
  available: boolean
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      is_available: available,
    })
    .eq("id", id);

  if (error) throw error;
}