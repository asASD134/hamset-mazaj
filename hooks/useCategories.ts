"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Category,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categories";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getCategories();

      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(name: string) {
    await createCategory(name);
    await refresh();
  }

  async function update(id: string, name: string) {
    await updateCategory(id, name);
    await refresh();
  }

  async function remove(id: string) {
    await deleteCategory(id);
    await refresh();
  }

  return {
    categories,
    loading,
    refresh,
    add,
    update,
    remove,
  };
}