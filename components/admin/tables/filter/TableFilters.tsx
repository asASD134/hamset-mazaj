"use client";

import { Table } from "@/types/table";

interface TableFiltersProps {
  search: string;
  status:
    | Table["status"]
    | "";
  onSearchChange: (
    value: string
  ) => void;
  onStatusChange: (
    value:
      | Table["status"]
      | ""
  ) => void;
}

export default function TableFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: TableFiltersProps) {
  return (
    <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-zinc-900 p-5">
      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block font-bold text-white">
            البحث
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              onSearchChange(
                e.target.value
              )
            }
            placeholder="ابحث برقم أو اسم الطاولة..."
            className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block font-bold text-white">
            حالة الطاولة
          </label>

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(
                e.target.value as
                  | Table["status"]
                  | ""
              )
            }
            className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none focus:border-yellow-500"
          >
            <option value="">
              جميع الحالات
            </option>

            <option value="available">
              متاحة
            </option>

            <option value="occupied">
              مشغولة
            </option>

            <option value="out_of_service">
              خارج الخدمة
            </option>
          </select>
        </div>

      </div>
    </div>
  );
}