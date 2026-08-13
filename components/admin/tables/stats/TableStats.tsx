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
    (table) => table.status === "available"
  ).length;

  const occupied = tables.filter(
    (table) => table.status === "occupied"
  ).length;

  const reserved = tables.filter(
    (table) => table.status === "reserved"
  ).length;

  const disabled = tables.filter(
    (table) => table.status === "disabled"
  ).length;

  const stats = [
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-5 text-center"
        >
          <p className="text-sm text-zinc-400">
            {stat.title}
          </p>

          <p
            className={`mt-2 text-4xl font-bold ${stat.color}`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}