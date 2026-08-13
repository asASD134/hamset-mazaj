import { supabase } from "@/lib/supabase";

import {
  Table,
  CreateTable,
  UpdateTable,
} from "@/types/table";

const TABLE_NAME = "tables";

function mapTable(item: any): Table {
  return {
    id: String(item.id),

    number: Number(item.table_number),

    name:
      item.table_name ||
      `الطاولة ${item.table_number}`,

    seats: Number(item.seats ?? 4),

    status: item.status ?? "available",

    qr_code: item.qr_code ?? null,

    created_at: item.created_at ?? "",
  };
}

export async function getTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("table_number", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTable);
}

export async function getTable(
  id: string
): Promise<Table | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw error;
  }

  return mapTable(data);
}

export async function createTable(
  table: CreateTable
): Promise<Table> {
  if (
    !Number.isInteger(table.number) ||
    table.number <= 0
  ) {
    throw new Error(
      "رقم الطاولة غير صحيح."
    );
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      table_number: table.number,

      table_name:
        table.name.trim() ||
        `الطاولة ${table.number}`,

      seats:
        table.seats > 0
          ? table.seats
          : 4,

      status:
        table.status ?? "available",
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "رقم الطاولة مستخدم بالفعل."
      );
    }

    throw error;
  }

  return mapTable(data);
}

export async function updateTable(
  table: UpdateTable
): Promise<Table> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      table_number: table.number,

      table_name:
        table.name.trim() ||
        `الطاولة ${table.number}`,

      seats:
        table.seats > 0
          ? table.seats
          : 4,

      status: table.status,
    })
    .eq("id", table.id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "رقم الطاولة مستخدم بالفعل."
      );
    }

    throw error;
  }

  return mapTable(data);
}

export async function deleteTable(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "لا يمكن حذف هذه الطاولة لأنها مرتبطة بطلبات موجودة."
      );
    }

    throw error;
  }
}

export async function updateTableStatus(
  id: string,
  status: Table["status"]
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      status,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}