"use client";

import { useState } from "react";

import { useTables } from "@/hooks/useTables";
import { Table } from "@/types/table";

import TableForm from "./form/TableForm";
import TablesList from "./layout/TablesList";
import EditTableModal from "./EditTableModal";

export default function TableManager() {
  const {
    tables,
    loading,
    add,
    update,
    remove,
    changeStatus,
  } = useTables();

  const [editingTable, setEditingTable] =
    useState<Table | null>(null);

  const [openEdit, setOpenEdit] =
    useState(false);

  async function copyLink(tableNumber: number) {
    const url =
      `${window.location.origin}/?table=${tableNumber}`;

    try {
      await navigator.clipboard.writeText(url);
      alert("تم نسخ رابط الطاولة.");
    } catch {
      alert("تعذر نسخ الرابط.");
    }
  }

  async function handleDelete(
    id: string,
    tableName: string,
    tableNumber: number
  ) {
    const ok = window.confirm(
      `هل أنت متأكد من حذف ${tableName} ؟\n\nرقم الطاولة: ${tableNumber}`
    );

    if (!ok) return;

    try {
      await remove(id);
      alert("تم حذف الطاولة بنجاح");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("حدث خطأ أثناء حذف الطاولة.");
      }
    }
  }

  function handleEdit(table: Table) {
    setEditingTable(table);
    setOpenEdit(true);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-xl">
        جاري تحميل الطاولات...
      </div>
    );
  }

  return (
    <>
      <main className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-yellow-400">
            إدارة الطاولات
          </h1>

          <p className="mt-2 text-zinc-400">
            إضافة وإدارة طاولات المقهى.
          </p>
        </div>

        <TableForm
          tables={tables}
          onAdd={add}
        />

        <TablesList
          tables={tables}
          onCopyLink={copyLink}
          onDelete={handleDelete}
          onChangeStatus={changeStatus}
          onEdit={handleEdit}
        />

      </main>

      <EditTableModal
        open={openEdit}
        table={editingTable}
        tables={tables}
        onClose={() => {
          setOpenEdit(false);
          setEditingTable(null);
        }}
        onSave={async (table) => {
          await update(table);

          setOpenEdit(false);
          setEditingTable(null);
        }}
      />
    </>
  );
}