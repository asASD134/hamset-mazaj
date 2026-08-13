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
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "خطأ في تحميل الطلبات:",
      {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Supabase: ${error.message}`
    );
  }

  return (data ?? []).map((order: any) => ({
    id: String(order.id),

    table_number:
      order.tables?.table_number ?? 0,

    status: order.status,

    total: Number(
      order.total_price ?? 0
    ),

    created_at:
      order.created_at,

    items:
      (order.order_items ?? []).map(
        (item: any) => ({
          id: String(
            item.menu?.id ?? ""
          ),

          name:
            item.menu?.name_ar ??
            "منتج",

          quantity:
            Number(
              item.quantity ?? 0
            ),

          price:
            Number(
              item.price ?? 0
            ),
        })
      ),
  }));
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<void> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    console.error(
      "SUPABASE UPDATE ORDER ERROR:",
      {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Supabase: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "لم يتم العثور على الطلب أو لم يتم تحديثه."
    );
  }
}