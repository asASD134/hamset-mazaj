"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TableItem {
  id: number;
  table_number: number;
  name?: string;
  is_active: boolean;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [newTable, setNewTable] = useState("");

  useEffect(() => {
    loadTables();

    const channel = supabase
      .channel("tables-admin")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
        },
        loadTables
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadTables() {
    const { data } = await supabase
      .from("tables")
      .select("*")
      .order("table_number");

    setTables((data as TableItem[]) ?? []);
  }

  async function addTable() {
    if (!newTable.trim()) return;

    await supabase.from("tables").insert({
      table_number: Number(newTable),
      is_active: true,
    });

    setNewTable("");
    loadTables();
  }

  async function toggleTable(table: TableItem) {
    await supabase
      .from("tables")
      .update({
        is_active: !table.is_active,
      })
      .eq("id", table.id);

    loadTables();
  }

  async function deleteTable(id: number) {
    if (!confirm("هل تريد حذف الطاولة؟")) return;

    await supabase
      .from("tables")
      .delete()
      .eq("id", id);

    loadTables();
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400">
            إدارة الطاولات
          </h1>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            value={newTable}
            onChange={(e) => setNewTable(e.target.value)}
            placeholder="رقم الطاولة"
            className="flex-1 rounded-xl bg-zinc-900 p-4"
          />

          <button
            onClick={addTable}
            className="rounded-xl bg-yellow-500 px-6 font-bold text-black"
          >
            إضافة
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800">

          <table className="w-full">

            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4">رقم الطاولة</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">QR</th>
                <th className="p-4">العمليات</th>
              </tr>
            </thead>

            <tbody>

              {tables.map((table) => (
                <tr
                  key={table.id}
                  className="border-t border-zinc-800"
                >
                  <td className="text-center p-4">
                    {table.table_number}
                  </td>

                  <td className="text-center">
                    {table.is_active ? (
                      <span className="text-green-400">
                        مفعلة
                      </span>
                    ) : (
                      <span className="text-red-400">
                        معطلة
                      </span>
                    )}
                  </td>

                  <td className="text-center">
                    <a
                      href={`/table/${table.table_number}`}
                      target="_blank"
                      className="text-yellow-400 underline"
                    >
                      فتح
                    </a>
                  </td>

                  <td className="text-center">

                    <button
                      onClick={() => toggleTable(table)}
                      className="mx-2 rounded bg-blue-600 px-3 py-2"
                    >
                      {table.is_active ? "تعطيل" : "تفعيل"}
                    </button>

                    <button
                      onClick={() => deleteTable(table.id)}
                      className="mx-2 rounded bg-red-600 px-3 py-2"
                    >
                      حذف
                    </button>

                  </td>
                </tr>
              ))}

              {tables.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-400"
                  >
                    لا توجد طاولات
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}