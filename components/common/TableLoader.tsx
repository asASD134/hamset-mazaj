"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTable } from "@/context/TableContext";

export default function TableLoader() {
  const searchParams = useSearchParams();

  const {
    tableNumber,
    setTableNumber,
  } = useTable();

  useEffect(() => {
    const table = searchParams.get("table");

    if (table) {
      setTableNumber(Number(table));
      return;
    }

    if (tableNumber !== null) {
      return;
    }

    const saved = localStorage.getItem("tableNumber");

    if (saved) {
      setTableNumber(Number(saved));
    }
  }, [searchParams, tableNumber, setTableNumber]);

  return null;
}