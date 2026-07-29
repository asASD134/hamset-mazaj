"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/services/orders";

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    refresh: loadOrders,
  };
}