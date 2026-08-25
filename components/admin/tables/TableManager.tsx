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

  async function copyLink(
    tableNumber: number
  ) {
    const cafe = new URLSearchParams(window.location.search).get("cafe") || decodeURIComponent(document.cookie.split("; ").find(v => v.startsWith("active_cafe_context="))?.split("=")[1] || "hamset-mazaj");
    const url = `${window.location.origin}/?cafe=${encodeURIComponent(cafe)}&table=${tableNumber}`;

    try {
      await navigator.clipboard.writeText(url);

      alert("تم نسخ رابط الطاولة.");
    } catch (error) {
      console.error(error);

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

    if (!ok) {
      return;
    }

    try {
      await remove(id);

      alert("تم حذف الطاولة بنجاح.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف الطاولة."
      );
    }
  }

  function handleEdit(table: Table) {
    setEditingTable(table);
    setOpenEdit(true);
  }

  function closeEdit() {
    setOpenEdit(false);
    setEditingTable(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-7xl text-center">
          جاري تحميل الطاولات...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">

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

      </div>

      <EditTableModal
        open={openEdit}
        table={editingTable}
        tables={tables}
        onClose={closeEdit}
        onSave={async (table) => {
          await update(table);
          closeEdit();
        }}
      />
    </main>
  );
}