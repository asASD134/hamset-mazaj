"use client";

import { useEffect, useState } from "react";

import {
  Table,
  UpdateTable,
} from "@/types/table";

interface Props {
  open: boolean;
  table: Table | null;
  tables: Table[];
  onClose: () => void;
  onSave: (
    table: UpdateTable
  ) => Promise<void>;
}

export default function EditTableModal({
  open,
  table,
  tables,
  onClose,
  onSave,
}: Props) {
  const [number, setNumber] =
    useState("");

  const [name, setName] =
    useState("");

  const [seats, setSeats] =
    useState("4");

  const [status, setStatus] =
    useState<Table["status"]>(
      "available"
    );

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!table) {
      return;
    }

    setNumber(
      String(table.number)
    );

    setName(
      table.name
    );

    setSeats(
      String(table.seats)
    );

    setStatus(
      table.status
    );
  }, [table]);

  if (!open || !table) {
    return null;
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const tableNumber =
      Number(number);

    const tableSeats =
      Number(seats);

    if (
      !Number.isInteger(
        tableNumber
      ) ||
      tableNumber <= 0
    ) {
      alert(
        "أدخل رقم طاولة صحيح."
      );
      return;
    }

    const duplicate =
      tables.some(
        (item) =>
          item.id !== table.id &&
          item.number ===
            tableNumber
      );

    if (duplicate) {
      alert(
        "رقم الطاولة مستخدم بالفعل."
      );
      return;
    }

    try {
      setLoading(true);

      await onSave({
        id: table.id,
        number: tableNumber,
        name:
          name.trim() ||
          `الطاولة ${tableNumber}`,
        seats:
          tableSeats > 0
            ? tableSeats
            : 4,
        status,
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تعديل الطاولة."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold text-yellow-400">
          تعديل الطاولة
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* رقم الطاولة */}
          <div>
            <label className="mb-2 block font-bold text-white">
              رقم الطاولة
            </label>

            <input
              type="number"
              min="1"
              required
              value={number}
              onChange={(e) =>
                setNumber(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* اسم الطاولة */}
          <div>
            <label className="mb-2 block font-bold text-white">
              اسم الطاولة
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* عدد المقاعد */}
          <div>
            <label className="mb-2 block font-bold text-white">
              عدد المقاعد
            </label>

            <input
              type="number"
              min="1"
              required
              value={seats}
              onChange={(e) =>
                setSeats(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
            />
          </div>

          {/* حالة الطاولة */}
          <div>
            <label className="mb-2 block font-bold text-white">
              حالة الطاولة
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as Table["status"]
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
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
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg bg-zinc-700 px-5 py-3 font-bold text-white transition hover:bg-zinc-600 disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "جارٍ الحفظ..."
                : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}