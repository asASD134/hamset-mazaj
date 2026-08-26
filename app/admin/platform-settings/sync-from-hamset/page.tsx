"use client";

import { useState } from "react";
import Link from "next/link";

export default function SyncFromHamsetPage() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function sync() {
    setRunning(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/platform-settings/sync-from-hamset", {
        method: "POST",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result?.error || "تعذر تنفيذ التوحيد.");

      setMessage(`تم توحيد النظام بنجاح. تم تحديث ${result?.updatedCount ?? 0} موقع.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تنفيذ التوحيد.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#050505] p-6 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-yellow-500/20 bg-[#121212] p-7 shadow-2xl">
        <h1 className="text-3xl font-black text-yellow-400">توحيد النظام من همسة مزاج</h1>
        <p className="mt-4 leading-8 text-zinc-400">
          هذه خطوة تأسيسية واحدة: تجعل همسة مزاج هو المرجع الكامل للنظام، ثم تنسخ بنية وإعدادات الموقع المشتركة إلى الإدارة العامة وبقية المقاهي. بيانات الهاتف والعنوان واللوجو الخاصة بكل مقهى تبقى في جدول بيانات المقهى ولا يتم نسخها هنا.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-300">
          بعد تنفيذها، نكمل أي تطوير جديد من الإدارة العامة، وأي تحديث في إعدادات الموقع المشتركة يُنشر إلى المقاهي الموجودة والجديدة.
        </div>

        {message && <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 font-bold text-emerald-300">{message}</div>}
        {error && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-bold text-red-300">{error}</div>}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={sync}
            disabled={running}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:bg-yellow-400 disabled:opacity-60"
          >
            {running ? "جارٍ توحيد المواقع..." : "ابدأ توحيد المواقع الآن"}
          </button>

          <Link
            href="/admin/settings?platform=1"
            className="rounded-xl border border-white/10 px-6 py-3 font-bold text-zinc-300 hover:border-yellow-500/30 hover:text-yellow-300"
          >
            فتح الإدارة العامة
          </Link>
        </div>
      </div>
    </main>
  );
}
