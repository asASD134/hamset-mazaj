"use client";

import { useCallback, useEffect, useState } from "react";

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

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getMenuItems();

      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(item: CreateMenuItem) {
    await createMenuItem(item);
    await refresh();
  }

  async function update(item: UpdateMenuItem) {
    await updateMenuItem(item);
    await refresh();
  }

  async function remove(id: string) {
    await deleteMenuItem(id);
    await refresh();
  }

  async function toggle(
    id: string,
    available: boolean
  ) {
    await toggleMenuAvailability(id, available);
    await refresh();
  }

  return {
    items,
    loading,
    refresh,
    add,
    update,
    remove,
    toggle,
  };
}