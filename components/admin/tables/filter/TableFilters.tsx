"use client";

import { Table } from "@/types/table";

interface Props {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: Table["status"] | "") => void;
}

export default function TableFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: Props) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-6">
      <div className="grid gap-4 md:grid-cols-2">

        <input
          type="text"
          placeholder="🔍 ابحث باسم أو رقم الطاولة..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-black p-3 text-white"
        />

        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as Table["status"] | "")
          }
          className="rounded-lg border border-zinc-700 bg-black p-3 text-white"
        >
          <option value="">جميع الحالات</option>
          <option value="available">متاحة</option>
          <option value="occupied">مشغولة</option>
          <option value="reserved">محجوزة</option>
          <option value="disabled">معطلة</option>
        </select>

      </div>
    </div>
  );
}