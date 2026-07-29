import { supabase } from "@/lib/supabase";
import { Order, OrderItem } from "../types/order";

export async function createOrder(
  tableNumber: number,
  items: OrderItem[]
): Promise<Order> {
  // حساب الإجمالي
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // البحث عن معرف الطاولة الحقيقي
  const { data: table, error: tableError } = await supabase
    .from("tables")
    .select("id")
    .eq("table_number", tableNumber)
    .single();

  if (tableError || !table) {
    throw new Error("الطاولة غير موجودة");
  }

  // إنشاء الطلب
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      table_id: table.id,
      total_price: total,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  // إضافة أصناف الطلب
  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_id: Number(item.id),
    quantity: item.quantity,
    price: item.price,
    total_price: item.price * item.quantity,
    notes: null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw itemsError;
  }

  return {
    id: order.id,
    tableNumber,
    items,
    total,
    status: order.status,
    createdAt: order.created_at,
  };
}