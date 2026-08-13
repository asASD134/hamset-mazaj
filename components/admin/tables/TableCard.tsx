"use client";

import TableQRCode from "./TableQRCode";

import { Table } from "@/types/table";

interface Props {
  table: Table;

  onCopyLink: (
    tableNumber: number
  ) => void;

  onDelete: (
    id: string,
    tableName: string,
    tableNumber: number
  ) => void;

  onChangeStatus: (
    id: string,
    status: Table["status"]
  ) => void;

  onEdit: (
    table: Table
  ) => void;
}

function getStatusInfo(
  status: Table["status"]
) {
  switch (status) {
    case "available":
      return {
        label: "متاحة",
        className:
          "border-green-500/20 bg-green-500/10 text-green-400",
        dot: "bg-green-400",
      };

    case "occupied":
      return {
        label: "مشغولة",
        className:
          "border-red-500/20 bg-red-500/10 text-red-400",
        dot: "bg-red-400",
      };

    case "reserved":
      return {
        label: "محجوزة",
        className:
          "border-blue-500/20 bg-blue-500/10 text-blue-400",
        dot: "bg-blue-400",
      };

    case "disabled":
      return {
        label: "معطلة",
        className:
          "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
        dot: "bg-zinc-400",
      };

    default:
      return {
        label: "غير معروف",
        className:
          "border-zinc-700 bg-zinc-800 text-zinc-400",
        dot: "bg-zinc-400",
      };
  }
}

export default function TableCard({
  table,
  onCopyLink,
  onDelete,
  onChangeStatus,
  onEdit,
}: Props) {
  const statusInfo =
    getStatusInfo(table.status);

  return (
    <div
      dir="rtl"
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition duration-200 hover:border-yellow-500/30 hover:shadow-xl hover:shadow-black/20"
    >
      {/* رأس البطاقة */}
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-5">
        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-xl">
              🪑
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                {table.name}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                رقم الطاولة:{" "}
                <span className="font-bold text-zinc-300">
                  {table.number}
                </span>
              </p>
            </div>

          </div>
        </div>

        {/* الحالة الحالية */}
        <div
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusInfo.className}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${statusInfo.dot}`}
          />

          {statusInfo.label}
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_150px]">

        {/* المعلومات والتحكم */}
        <div className="space-y-4">

          {/* معلومات الطاولة */}
          <div className="grid grid-cols-2 gap-3">

            {/* رقم الطاولة */}
            <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
              <p className="text-xs text-zinc-500">
                رقم الطاولة
              </p>

              <p className="mt-1 text-xl font-black text-white">
                {table.number}
              </p>
            </div>

            {/* عدد المقاعد */}
            <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
              <p className="text-xs text-zinc-500">
                عدد المقاعد
              </p>

              <p className="mt-1 text-xl font-black text-white">
                {table.seats}
              </p>
            </div>

          </div>

          {/* تغيير الحالة */}
          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-300">
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
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="available">
                متاحة
              </option>

              <option value="occupied">
                مشغولة
              </option>

              <option value="reserved">
                محجوزة
              </option>

              <option value="disabled">
                معطلة
              </option>
            </select>
          </div>

          {/* الأزرار */}
          <div className="grid grid-cols-3 gap-2">

            {/* نسخ الرابط */}
            <button
              type="button"
              onClick={() =>
                onCopyLink(
                  table.number
                )
              }
              className="rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              نسخ الرابط
            </button>

            {/* تعديل */}
            <button
              type="button"
              onClick={() =>
                onEdit(table)
              }
              className="rounded-xl bg-green-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-green-500"
            >
              تعديل
            </button>

            {/* حذف */}
            <button
              type="button"
              onClick={() =>
                onDelete(
                  table.id,
                  table.name,
                  table.number
                )
              }
              className="rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-500"
            >
              حذف
            </button>

          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center">

          <div className="rounded-2xl border border-zinc-800 bg-white p-3 shadow-lg">
            <TableQRCode
              tableNumber={
                table.number
              }
            />
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            QR الطاولة
          </p>

        </div>
      </div>
    </div>
  );
}