import { supabase } from "@/lib/supabase";
import { Order, OrderItem } from "../types/order";

export async function createOrder(
  tableNumber: number,
  items: OrderItem[],
  clientRequestId: string
): Promise<Order> {
  if (!items.length) {
    throw new Error("السلة فارغة");
  }

  const payload = items.map((item) => ({
    menu_id: Number(item.id),
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.rpc(
    "create_order_with_items",
    {
      p_table_number: tableNumber,
      p_client_request_id: clientRequestId,
      p_items: payload,
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("لم يتم استلام بيانات الطلب");
  }

  return {
    id: data.order_id,
    tableNumber,
    items,
    total: Number(data.total_price),
    status: data.status,
    createdAt: data.created_at,
  };
}