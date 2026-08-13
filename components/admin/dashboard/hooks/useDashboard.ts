"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getDashboardStats } from "@/services/dashboard";
import type { DashboardStats } from "@/services/dashboard";

export function useDashboard() {
  const [stats, setStats] =
    useState<DashboardStats>({
      orders: 0,
      pendingOrders: 0,
      serviceRequests: 0,
      sales: 0,
      products: 0,
      tables: 0,
      availableTables: 0,
      occupiedTables: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

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
  }, []);

  useEffect(() => {
    refresh();

    return undefined;
  }, [refresh]);

  return {
    stats,
    loading,
    refresh,
  };
}