"use client";

import { useState } from "react";
import { CreateTable, Table } from "@/types/table";

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

  async function handleAdd() {
    if (!number.trim()) {
      alert("أدخل رقم الطاولة");
      return;
    }

    const tableNumber = Number(number);

    const exists = tables.some(
      (table) => table.number === tableNumber
    );

    if (exists) {
      alert(`رقم الطاولة ${tableNumber} مستخدم بالفعل.`);
      return;
    }

    try {
      await onAdd({
        number: tableNumber,
        name: name || `طاولة ${tableNumber}`,
        seats: Number(seats),
        status: "available",
      });

      setNumber("");
      setName("");
      setSeats("4");

      alert("تمت إضافة الطاولة بنجاح");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("حدث خطأ أثناء إضافة الطاولة");
      }
    }
  }

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-6">
      <div className="grid gap-4 md:grid-cols-4">

        <input
          type="number"
          placeholder="رقم الطاولة"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-black p-3"
        />

        <input
          placeholder="اسم الطاولة"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-black p-3"
        />

        <input
          type="number"
          placeholder="عدد المقاعد"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-black p-3"
        />

        <button
          onClick={handleAdd}
          className="rounded-lg bg-yellow-500 p-3 font-bold text-black hover:bg-yellow-400"
        >
          إضافة طاولة
        </button>

      </div>
    </div>
  );
}