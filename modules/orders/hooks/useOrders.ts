"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../services/order.service";

export function useOrders() {
  const [orders, setOrders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getOrders();

        setOrders(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل الطلبات"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateStatus(
    id: string,
    status: string
  ) {
    await updateOrderStatus(
      id,
      status
    );

    await refresh();
  }

  async function remove(
    id: string
  ) {
    await deleteOrder(id);
    await refresh();
  }

  return {
    orders,
    loading,
    error,
    refresh,
    updateStatus,
    remove,
  };
}