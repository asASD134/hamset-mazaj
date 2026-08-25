"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId, getClientCafeContext } from "@/lib/cafe-context-client";

interface TableItem {
  id: number;
  table_number: number;
  table_name: string;
  status: string;
}

export default function TablesQRPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    setLoading(true);
    setErrorMessage("");

    const cafeId = await getClientCafeId();
    const { data, error } = await supabase.from("tables").select("*").eq("cafe_id", cafeId).order("table_number");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setTables((data as TableItem[]) ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl">جاري تحميل الطاولات...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold text-yellow-400 mb-8">
        QR للطاولات
      </h1>

      {errorMessage && (
        <div className="mb-8 rounded-xl bg-red-700 p-4">
          <strong>خطأ من Supabase:</strong>
          <br />
          {errorMessage}
        </div>
      )}

      {!errorMessage && tables.length === 0 && (
        <div className="rounded-xl bg-yellow-600 text-black p-6 font-bold">
          لا توجد أي طاولات داخل قاعدة البيانات.
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {tables.map((table) => (
          <div
            key={table.id}
            className="rounded-2xl bg-white text-black p-6 text-center"
          >
            <QRCode
              value={`${window.location.origin}/?cafe=${encodeURIComponent(getClientCafeContext())}&table=${table.table_number}`}
              size={180}
            />

            <h2 className="mt-4 text-2xl font-bold">
              {table.table_name}
            </h2>

            <p className="mt-2">
              رقم الطاولة: {table.table_number}
            </p>

            <p className="mt-2 text-green-700">
              الحالة: {table.status}
            </p>
          </div>
        ))}

      </div>
    </main>
  );
}