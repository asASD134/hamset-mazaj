import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  orders: number;
  products: number;
  tables: number;
  activeOrders: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    orders,
    products,
    tables,
    activeOrders,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("menu")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("tables")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", [
        "pending",
        "preparing",
        "ready",
      ]),
  ]);

  return {
    orders: orders.count ?? 0,
    products: products.count ?? 0,
    tables: tables.count ?? 0,
    activeOrders: activeOrders.count ?? 0,
  };
}