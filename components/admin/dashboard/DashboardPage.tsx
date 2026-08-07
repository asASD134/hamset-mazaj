"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "./DashboardLayout";
import DashboardCards from "./DashboardCards";
import QuickActions from "./QuickActions";
import SystemStatus from "./SystemStatus";

import {
  DashboardStats,
  loadDashboard,
  createDashboardChannel,
} from "./DashboardLogic";

import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats>({
      orders: 0,
      products: 0,
      tables: 0,
      activeOrders: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const refresh = () =>
      loadDashboard(setStats, setLoading);

    refresh();

    const channel =
      createDashboardChannel(refresh);

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      description="مرحبًا بك في لوحة تحكم همسة مزاج"
    >
      <DashboardCards
        totalTables={stats.tables}
        availableTables={0}
        occupiedTables={stats.activeOrders}
        totalOrders={stats.orders}
        todaySales={0}
        totalCustomers={0}
      />

      <QuickActions />

      <SystemStatus />
    </DashboardLayout>
  );
}