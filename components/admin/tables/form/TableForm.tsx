"use client";

import { useState } from "react";

import {
  CreateTable,
  Table,
} from "@/types/table";

interface Props {
  tables: Table[];
  onAdd: (table: CreateTable) => Promise<void>;
}

export default function TableForm({
  tables,
  onAdd,
}: Props) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [seats, setSeats] = useState("4");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const tableNumber = Number(number);
    const tableSeats = Number(seats);

    if (
      !Number.isInteger(tableNumber) ||
      tableNumber <= 0
    ) {
      alert("أدخل رقم طاولة صحيح.");
      return;
    }

    if (
      !Number.isInteger(tableSeats) ||
      tableSeats <= 0
    ) {
      alert("أدخل عدد مقاعد صحيح.");
      return;
    }

    if (
      tables.some(
        (table) =>
          table.number === tableNumber
      )
    ) {
      alert("رقم الطاولة موجود بالفعل.");
      return;
    }

    try {
      setLoading(true);

      await onAdd({
        number: tableNumber,

        name:
          name.trim() ||
          `الطاولة ${tableNumber}`,

        seats: tableSeats,

        status: "available",
      });

      setNumber("");
      setName("");
      setSeats("4");

      alert("تمت إضافة الطاولة بنجاح.");
    } catch (error) {
      console.error(
        "خطأ أثناء إضافة الطاولة:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إضافة الطاولة."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-black/40 p-5"
    >
      <div className="grid gap-4 md:grid-cols-4">

        {/* رقم الطاولة */}
        <input
          type="number"
          min="1"
          required
          value={number}
          onChange={(e) =>
            setNumber(e.target.value)
          }
          placeholder="رقم الطاولة"
          className="rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
        />

        {/* اسم الطاولة */}
        <input
          type="text"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="اسم الطاولة"
          className="rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
        />

        {/* عدد المقاعد */}
        <input
          type="number"
          min="1"
          required
          value={seats}
          onChange={(e) =>
            setSeats(e.target.value)
          }
          placeholder="عدد المقاعد"
          className="rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
        />

        {/* زر الإضافة */}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-yellow-500 p-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "جارٍ الإضافة..."
            : "إضافة طاولة"}
        </button>

      </div>
    </form>
  );
}