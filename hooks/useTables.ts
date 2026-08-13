"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} from "@/services/tables";

import {
  Table,
  CreateTable,
  UpdateTable,
} from "@/types/table";

export function useTables() {
  const [tables, setTables] =
    useState<Table[]>([]);

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
          await getTables();

        setTables(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل الطاولات"
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

  async function add(
    table: CreateTable
  ) {
    await createTable(table);
    await refresh();
  }

  async function update(
    table: UpdateTable
  ) {
    await updateTable(table);
    await refresh();
  }

  async function remove(
    id: string
  ) {
    await deleteTable(id);
    await refresh();
  }

  async function changeStatus(
    id: string,
    status: Table["status"]
  ) {
    await updateTableStatus(
      id,
      status
    );

    await refresh();
  }

  return {
    tables,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
    changeStatus,
  };
}