import { supabase } from "@/lib/supabase";

export interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderInput {
  tableId?: string | null;
  tableNumber?: number | null;
  customerName?: string | null;
  notes?: string | null;
  items: OrderItemInput[];
}

export async function createOrder(
  input: CreateOrderInput
) {
  if (!input.items.length) {
    throw new Error(
      "يجب إضافة منتج واحد على الأقل للطلب"
    );
  }

  const total = input.items.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const { data, error } =
    await supabase
      .from("orders")
      .insert({
        table_id:
          input.tableId ?? null,
        table_number:
          input.tableNumber ?? null,
        customer_name:
          input.customerName ?? null,
        notes:
          input.notes ?? null,
        total_price: total,
        status: "pending",
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  const orderItems = input.items.map(
    (item) => ({
      order_id: data.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
    })
  );

  const { error: itemsError } =
    await supabase
      .from("order_items")
      .insert(orderItems);

  if (itemsError) {
    await supabase
      .from("orders")
      .delete()
      .eq("id", data.id);

    throw new Error(
      itemsError.message
    );
  }

  return data;
}

export async function getOrders() {
  const { data, error } =
    await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          menu (
            id,
            name_ar,
            price,
            image_url
          )
        )
      `)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getOrder(
  id: string
) {
  const { data, error } =
    await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          menu (
            id,
            name_ar,
            price,
            image_url
          )
        )
      `)
      .eq("id", id)
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrderStatus(
  id: string,
  status: string
) {
  const { data, error } =
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteOrder(
  id: string
) {
  const { error } =
    await supabase
      .from("orders")
      .delete()
      .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}