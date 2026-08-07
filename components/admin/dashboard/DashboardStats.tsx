"use client";

import { Table } from "@/types/table";

interface Props {
  tables: Table[];
}

export default function DashboardStats({
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

  const occupancy =
    total === 0
      ? 0
      : Math.round(
          ((occupied + reserved) / total) * 100
        );

  const stats = [
    {
      title: "إجمالي الطاولات",
      value: total,
      color: "text-yellow-400",
      icon: "🍽️",
    },
    {
      title: "متاحة",
      value: available,
      color: "text-green-400",
      icon: "🟢",
    },
    {
      title: "مشغولة",
      value: occupied,
      color: "text-red-400",
      icon: "🔴",
    },
    {
      title: "محجوزة",
      value: reserved,
      color: "text-blue-400",
      icon: "🔵",
    },
    {
      title: "معطلة",
      value: disabled,
      color: "text-zinc-400",
      icon: "⚫",
    },
    {
      title: "نسبة الإشغال",
      value: `${occupancy}%`,
      color: "text-purple-400",
      icon: "📈",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6 transition hover:border-yellow-500/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">
              {stat.icon}
            </span>

            <span
              className={`text-4xl font-bold ${stat.color}`}
            >
              {stat.value}
            </span>
          </div>

          <p className="mt-4 text-zinc-400">
            {stat.title}
          </p>
        </div>
      ))}
    </div>
  );
}