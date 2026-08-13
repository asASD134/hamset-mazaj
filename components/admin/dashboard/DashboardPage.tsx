"use client";

import { useEffect } from "react";

import DashboardLayout from "./DashboardLayout";
import DashboardCards from "./DashboardCards";
import QuickActions from "./QuickActions";
import SystemStatus from "./SystemStatus";

import { useDashboard } from "./hooks/useDashboard";
import { supabase } from "@/lib/supabase";
import { useCafeSettings } from "@/context/CafeSettingsContext";

export default function DashboardPage() {
  const {
    stats,
    loading,
    refresh,
  } = useDashboard();

  const { settings } = useCafeSettings();

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-page-realtime")
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        جاري تحميل لوحة التحكم...
      </div>
    );
  }

  return (
    <DashboardLayout
      title="لوحة التحكم"
      description={`مرحبًا بك في لوحة تحكم ${settings.cafe_name ?? "همسة مزاج"}`}
    >
      <DashboardCards
        totalTables={stats.tables}
        availableTables={stats.availableTables}
        occupiedTables={stats.occupiedTables}
        totalOrders={stats.orders}
        pendingOrders={stats.pendingOrders}
        serviceRequests={stats.serviceRequests}
        todaySales={stats.sales}
        totalProducts={stats.products}
      />

      <QuickActions />

      <SystemStatus />
    </DashboardLayout>
  );
}