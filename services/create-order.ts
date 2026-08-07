import { supabase } from "@/lib/supabase";

export interface CreateOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface CreateOrderParams {
  tableNumber: number;
  items: CreateOrderItem[];
  total: number;
}

export async function createOrder({
  tableNumber,
  items,
  total,
}: CreateOrderParams) {
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        table_number: tableNumber,
        items,
        total,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}