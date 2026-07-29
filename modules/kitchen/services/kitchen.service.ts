import { supabase } from "@/lib/supabase";
import { KitchenOrder } from "../types/kitchen";

export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      total_price,
      notes,
      status,
      created_at,
      tables (
        table_number
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
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .filter(
      (order: any) =>
        order.order_items &&
        order.order_items.length > 0
    )
    .map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      tableNumber: order.tables?.table_number ?? 0,

      items: order.order_items.map((item: any) => ({
        id: item.menu?.id ?? 0,
        name: item.menu?.name_ar ?? "",
        quantity: item.quantity,
        price: item.price,
      })),

      totalPrice: order.total_price,
      notes: order.notes ?? "",
      status: order.status,
      createdAt: order.created_at,
    }));
}

export async function addKitchenOrder() {
  throw new Error("غير مستخدمة");
}

export async function updateKitchenOrderStatus(
  id: number,
  status: KitchenOrder["status"]
) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}