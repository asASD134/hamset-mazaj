"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TablePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const tableNumber = Number(params.number);

    if (!tableNumber || Number.isNaN(tableNumber)) {
      router.replace("/");
      return;
    }

    localStorage.setItem(
      "tableNumber",
      String(tableNumber)
    );

    router.replace("/");
  }, [params.number, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

        <h1 className="text-3xl font-bold text-yellow-400">
          جاري تجهيز الطاولة...
        </h1>

        <p className="mt-4 text-zinc-400">
          سيتم تحويلك إلى الصفحة الرئيسية خلال لحظات.
        </p>
      </div>
    </main>
  );
}