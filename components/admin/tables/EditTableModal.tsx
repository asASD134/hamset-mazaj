"use client";

import { useEffect, useState } from "react";
import { Table, UpdateTable } from "@/types/table";

interface Props {
  open: boolean;
  table: Table | null;
  tables: Table[];
  onClose: () => void;
  onSave: (table: UpdateTable) => Promise<void>;
}

export default function EditTableModal({
  open,
  table,
  tables,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [seats, setSeats] = useState("4");
  const [status, setStatus] =
    useState<Table["status"]>("available");

  useEffect(() => {
    if (!table) return;

    setName(table.name);
    setNumber(String(table.number));
    setSeats(String(table.seats));
    setStatus(table.status);
  }, [table]);

  if (!open || !table) return null;

  async function handleSave() {
    const tableNumber = Number(number);

    const exists = tables.some(
      (item) =>
        item.id !== table.id &&
        item.number === tableNumber
    );

    if (exists) {
      alert(`رقم الطاولة ${tableNumber} مستخدم بالفعل.`);
      return;
    }

    try {
      await onSave({
        id: table.id,
        name,
        number: tableNumber,
        seats: Number(seats),
        status,
      });

      alert("تم حفظ التعديلات بنجاح");
      onClose();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("حدث خطأ أثناء حفظ التعديلات");
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6">

        <h2 className="mb-6 text-center text-3xl font-bold text-yellow-400">
          تعديل الطاولة
        </h2>

        <div className="space-y-5">

          <div>
            <label className="mb-2 block font-bold text-yellow-400">
              اسم الطاولة
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold text-yellow-400">
              رقم الطاولة
            </label>

            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold text-yellow-400">
              عدد المقاعد
            </label>

            <input
              type="number"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold text-yellow-400">
              حالة الطاولة
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as Table["status"])
              }
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white"
            >
              <option value="available">متاحة</option>
              <option value="occupied">مشغولة</option>
              <option value="reserved">محجوزة</option>
              <option value="disabled">معطلة</option>
            </select>
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-700 px-6 py-3 font-bold text-white hover:bg-zinc-600"
          >
            إلغاء
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400"
          >
            حفظ التعديلات
          </button>

        </div>

      </div>
    </div>
  );
}