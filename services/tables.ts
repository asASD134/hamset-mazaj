import { supabase } from "@/lib/supabase";
import {
  Table,
  CreateTable,
  UpdateTable,
} from "@/types/table";

const TABLE_NAME = "tables";

export async function getTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("table_number", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    (data ?? []).map((item: any) => ({
      id: String(item.id),
      number: item.table_number,
      name: item.table_name,
      seats: 4,
      status: item.status,
      qr_code: item.qr_code,
      created_at: item.created_at,
    })) as Table[]
  );
}

export async function getTable(
  id: string
): Promise<Table | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: String(data.id),
    number: data.table_number,
    name: data.table_name,
    seats: 4,
    status: data.status,
    qr_code: data.qr_code,
    created_at: data.created_at,
  };
}

export async function createTable(
  table: CreateTable
): Promise<Table> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      table_number: table.number,
      table_name: table.name,
      status: table.status ?? "available",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: String(data.id),
    number: data.table_number,
    name: data.table_name,
    seats: 4,
    status: data.status,
    qr_code: data.qr_code,
    created_at: data.created_at,
  };
}

export async function updateTable(
  table: UpdateTable
): Promise<Table> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      table_number: table.number,
      table_name: table.name,
      status: table.status,
    })
    .eq("id", table.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: String(data.id),
    number: data.table_number,
    name: data.table_name,
    seats: 4,
    status: data.status,
    qr_code: data.qr_code,
    created_at: data.created_at,
  };
}

export async function deleteTable(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
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