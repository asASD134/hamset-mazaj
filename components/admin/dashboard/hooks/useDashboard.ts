"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getDashboardStats } from "@/services/dashboard";

interface DashboardStats {
  orders: number;
  products: number;
  tables: number;
  activeOrders: number;
}

export function useDashboard() {
  const [stats, setStats] =
    useState<DashboardStats>({
      orders: 0,
      products: 0,
      tables: 0,
      activeOrders: 0,
    });

  const [loading, setLoading] =
    useState(true);

  async function loadDashboard() {
    try {
      const data =
        await getDashboardStats();

      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }