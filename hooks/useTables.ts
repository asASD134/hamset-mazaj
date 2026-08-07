"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getTables();

      setTables(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(table: CreateTable) {
    await createTable(table);
    await refresh();
  }

  async function update(table: UpdateTable) {
    await updateTable(table);
    await refresh();
  }

  async function remove(id: string) {
    await deleteTable(id);
    await refresh();
  }

  async function changeStatus(
    id: string,
    status: Table["status"]
  ) {
    await updateTableStatus(id, status);
    await refresh();
  }

  return {
    tables,
    loading,
    refresh,
    add,
    update,
    remove,
    changeStatus,
  };
}