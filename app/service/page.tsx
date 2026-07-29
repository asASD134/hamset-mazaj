"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTable } from "@/context/TableContext";

export default function ServicePage() {
  const { hasTable, tableNumber } = useTable();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);

  const service =
    searchParams.get("type") || "call_waiter";

  async function sendRequest(type: string) {
    if (!hasTable || !tableNumber) return;

    setLoading(true);

    try {
      // سيتم ربطه مع Supabase لاحقاً
      alert(
        `تم إرسال الطلب\n\nالطاولة: ${tableNumber}\nالخدمة: ${type}`
      );
    } finally {
      setLoading(false);
    }
  }

  if (!hasTable) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400">
            هذه الصفحة متاحة فقط لعملاء الطاولات
          </h1>

          <p className="mt-4 text-gray-400">
            يرجى الدخول باستخدام QR الخاص بالطاولة.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-4xl font-bold text-yellow-400 text-center">
          خدمات الطاولة
        </h1>

        <p className="text-center mt-3 text-gray-300">
          الطاولة رقم {tableNumber}
        </p>

        <div className="mt-10 rounded-3xl bg-zinc-900 p-8">

          <p className="text-center text-xl mb-8">
            الخدمة المطلوبة:
          </p>

          <div className="text-center text-3xl font-bold text-yellow-400 mb-10">
            {service}
          </div>

          <button
            onClick={() => sendRequest(service)}
            disabled={loading}
            className="w-full rounded-2xl bg-yellow-500 py-4 text-xl font-bold text-black hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
          </button>

        </div>

      </div>
    </main>
  );
}