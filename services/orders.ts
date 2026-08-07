import { supabase } from "@/lib/supabase";
import { Order } from "@/types/order";

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      total_price,
      created_at,
      tables (
        number
      ),
      order_items (
        quantity,
        price,
        menu (
          id,
          name_ar
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((order: any) => ({
    id: String(order.id),
    table_number: order.tables?.number ?? 0,
    status: order.status,
    total: Number(order.total_price),
    created_at: order.created_at,
    items: (order.order_items ?? []).map((item: any) => ({
      id: String(item.menu?.id ?? ""),
      name: item.menu?.name_ar ?? "منتج",
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }));
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw error;
  }
}