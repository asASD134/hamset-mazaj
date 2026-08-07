"use client";

import { Table } from "@/types/table";

interface Props {
  tables: Table[];
}

export default function TableStats({
  tables,
}: Props) {
  const total = tables.length;

  const available = tables.filter(
    (t) => t.status === "available"
  ).length;

  const occupied = tables.filter(
    (t) => t.status === "occupied"
  ).length;

  const reserved = tables.filter(
    (t) => t.status === "reserved"
  ).length;

  const disabled = tables.filter(
    (t) => t.status === "disabled"
  ).length;

  const cards = [
    {
      title: "إجمالي الطاولات",
      value: total,
      color: "text-yellow-400",
    },
    {
      title: "متاحة",
      value: available,
      color: "text-green-400",
    },
    {
      title: "مشغولة",
      value: occupied,
      color: "text-red-400",
    },
    {
      title: "محجوزة",
      value: reserved,
      color: "text-blue-400",
    },
    {
      title: "معطلة",
      value: disabled,
      color: "text-zinc-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-5 text-center"
        >
          <p className="text-sm text-zinc-400">
            {card.title}
          </p>

          <h2
            className={`mt-2 text-3xl font-bold ${card.color}`}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}