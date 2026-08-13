import { RealtimeChannel } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import {
  DashboardStats,
  getDashboardStats,
} from "@/services/dashboard";

export type { DashboardStats };

export async function loadDashboard(
  setStats: (stats: DashboardStats) => void,
  setLoading: (loading: boolean) => void
) {
  try {
    const data =
      await getDashboardStats();

    setStats(data);
  } catch (error) {
    console.error(
      "خطأ في تحميل لوحة التحكم:",
      error
    );
  } finally {
    setLoading(false);
  }
}

export function createDashboardChannel(
  refresh: () => void
): RealtimeChannel {
  return supabase
    .channel("dashboard-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      refresh
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "service_requests",
      },
      refresh
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "menu",
      },
      refresh
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tables",
      },
      refresh
    )
    .subscribe();
}