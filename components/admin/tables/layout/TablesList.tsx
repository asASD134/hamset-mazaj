"use client";

import { useState } from "react";

import { Table } from "@/types/table";

import TableCard from "../TableCard";
import TableFilters from "../filter/TableFilters";
import TableStats from "../stats/TableStats";

interface Props {
  tables: Table[];
  onCopyLink: (tableNumber: number) => void;
  onDelete: (
    id: string,
    tableName: string,
    tableNumber: number
  ) => void;
  onChangeStatus: (
    id: string,
    status: Table["status"]
  ) => void;
  onEdit: (table: Table) => void;
}

export default function TablesList({
  tables,
  onCopyLink,
  onDelete,
  onChangeStatus,
  onEdit,
}: Props) {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<Table["status"] | "">("");

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      table.number
        .toString()
        .includes(search);

    const matchesStatus =
      statusFilter === "" ||
      table.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">

      <TableStats tables={tables} />

      <TableFilters
        search={search}
        status={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
      />

      {filteredTables.length === 0 ? (
        <div className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-10 text-center">
          لا توجد نتائج.
        </div>
      ) : (
        filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onCopyLink={onCopyLink}
            onDelete={onDelete}
            onChangeStatus={onChangeStatus}
            onEdit={onEdit}
          />
        ))
      )}

    </div>
  );
}