import { supabase } from "@/lib/supabase";

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function updateOrderStatus(
  id: number,
  status: string
) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteOrder(id: number) {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) throw error;
}