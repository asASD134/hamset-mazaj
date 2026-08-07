"use client";

import TableQRCode from "./TableQRCode";
import { Table, UpdateTable } from "@/types/table";

interface Props {
  table: Table;
  onCopyLink: (tableNumber: number) => void;
  onDelete: (
    id: string,
    tableName: string,
    tableNumber: number
  ) => void;
  onChangeStatus: (
    id: string,
    status: Table["status"]
  ) => void;
  onEdit: (table: Table) => void;
}

export default function TableCard({
  table,
  onCopyLink,
  onDelete,
  onChangeStatus,
  onEdit,
}: Props) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">
              {table.name}
            </h2>

            <p className="mt-1 text-zinc-400">
              رقم الطاولة: {table.number}
            </p>

            <p className="text-zinc-400">
              عدد المقاعد: {table.seats}
            </p>
          </div>

          <div>
            <label className="mb-2 block font-bold">
              حالة الطاولة
            </label>

            <select
              value={table.status}
              onChange={(e) =>
                onChangeStatus(
                  table.id,
                  e.target.value as Table["status"]
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-black p-3"
            >
              <option value="available">متاحة</option>
              <option value="occupied">مشغولة</option>
              <option value="reserved">محجوزة</option>
              <option value="disabled">معطلة</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onCopyLink(table.number)}
              className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
            >
              نسخ الرابط
            </button>

            <button
              onClick={() => onEdit(table)}
              className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-500"
            >
              تعديل
            </button>

            <button
              onClick={() =>
                onDelete(
                  table.id,
                  table.name,
                  table.number
                )
              }
              className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500"
            >
              حذف
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <TableQRCode tableNumber={table.number} />
        </div>
      </div>
    </div>
  );
}