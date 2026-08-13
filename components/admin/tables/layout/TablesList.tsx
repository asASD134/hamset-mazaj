"use client";

import { useState } from "react";

import { Table } from "@/types/table";

import TableCard from "../TableCard";
import TableFilters from "../filter/TableFilters";
import TableStats from "../stats/TableStats";

interface Props {
  tables: Table[];

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

export default function TablesList({
  tables,
  onCopyLink,
  onDelete,
  onChangeStatus,
  onEdit,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<Table["status"] | "">("");

  const filteredTables =
    tables.filter((table) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        table.name
          .toLowerCase()
          .includes(searchValue) ||
        table.number
          .toString()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "" ||
        table.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      {/* الإحصائيات */}

      <TableStats
        tables={tables}
      />

      {/* البحث والفلاتر */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <TableFilters
          search={search}
          status={statusFilter}
          onSearchChange={setSearch}
          onStatusChange={
            setStatusFilter
          }
        />
      </div>

      {/* عنوان القائمة */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-black text-white">
            الطاولات
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            عرض{" "}
            <span className="font-bold text-yellow-400">
              {filteredTables.length}
            </span>{" "}
            من أصل{" "}
            <span className="font-bold text-zinc-300">
              {tables.length}
            </span>{" "}
            طاولة
          </p>
        </div>

        {search ||
        statusFilter ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-yellow-500/50 hover:text-yellow-400"
          >
            مسح الفلاتر
          </button>
        ) : null}

      </div>

      {/* الطاولات */}

      {filteredTables.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-4xl">
            🪑
          </div>

          <h3 className="mt-5 text-lg font-bold text-white">
            لا توجد طاولات
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            لم يتم العثور على طاولات مطابقة للبحث أو الفلتر.
          </p>

          {(search ||
            statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="mt-5 rounded-xl bg-yellow-500 px-5 py-2.5 font-bold text-black transition hover:bg-yellow-400"
            >
              عرض جميع الطاولات
            </button>
          )}

        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {filteredTables.map(
            (table) => (
              <TableCard
                key={table.id}
                table={table}
                onCopyLink={
                  onCopyLink
                }
                onDelete={
                  onDelete
                }
                onChangeStatus={
                  onChangeStatus
                }
                onEdit={onEdit}
              />
            )
          )}

        </div>
      )}
    </div>
  );
}