"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuAvailability,
} from "@/services/menu";

import {
  MenuItem,
  CreateMenuItem,
  UpdateMenuItem,
} from "@/types/menu";

type MenuContext = { platform?: boolean };

export function useMenu(context?: MenuContext) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMenuItems(context);
      setItems(data);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء تحميل المنيو");
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(item: CreateMenuItem) {
    await createMenuItem(item, context);
    await refresh();
  }

  async function update(item: UpdateMenuItem) {
    await updateMenuItem(item, context);
    await refresh();
  }

  async function remove(id: string) {
    await deleteMenuItem(id, context);
    await refresh();
  }

  async function toggle(id: string, available: boolean) {
    await toggleMenuAvailability(id, available, context);
    await refresh();
  }

  return {
    items,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
    toggle,
  };
}