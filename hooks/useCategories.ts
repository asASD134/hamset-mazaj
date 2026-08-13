"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Category,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categories";

export function useCategories() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل التصنيفات"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(
    name: string,
    sortOrder = 0
  ) {
    await createCategory(name, sortOrder);
    await refresh();
  }

  async function update(
    id: string,
    name: string,
    sortOrder?: number
  ) {
    await updateCategory(
      id,
      name,
      sortOrder
    );

    await refresh();
  }

  async function remove(id: string) {
    await deleteCategory(id);
    await refresh();
  }

  return {
    categories,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
  };
}