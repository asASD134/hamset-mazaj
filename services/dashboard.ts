import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  orders: number;
  pendingOrders: number;
  serviceRequests: number;
  sales: number;
  products: number;
  tables: number;
  availableTables: number;
  occupiedTables: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    ordersResult,
    servicesResult,
    productsResult,
    tablesResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("status, total_price"),

    supabase
      .from("service_requests")
      .select("status"),

    supabase
      .from("menu")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("tables")
      .select("status"),
  ]);

  if (ordersResult.error) {
    throw ordersResult.error;
  }

  if (servicesResult.error) {
    throw servicesResult.error;
  }

  if (productsResult.error) {
    throw productsResult.error;
  }

  if (tablesResult.error) {
    throw tablesResult.error;
  }

  const orders = ordersResult.data ?? [];
  const services = servicesResult.data ?? [];
  const tables = tablesResult.data ?? [];

  return {
    orders: orders.length,

    pendingOrders: orders.filter(
      (order) => order.status === "pending"
    ).length,

    serviceRequests: services.filter(
      (service) => service.status === "pending"
    ).length,

    sales: orders.reduce(
      (sum, order) =>
        sum + Number(order.total_price ?? 0),
      0
    ),

    products: productsResult.count ?? 0,

    tables: tables.length,

    availableTables: tables.filter(
      (table) => table.status === "available"
    ).length,

    occupiedTables: tables.filter(
      (table) => table.status === "occupied"
    ).length,
  };
}