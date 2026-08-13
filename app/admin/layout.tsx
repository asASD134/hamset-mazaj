"use client";

import Link from "next/link";
import SiteName from "@/components/SiteName";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!data?.session) {
        router.replace("/login");
        return;
      }

      setCheckingSession(false);
    }

    verifySession();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checkingSession) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-[#0b0b0b] text-white"
    >
      <aside className="w-72 shrink-0 border-l border-yellow-500/20 bg-[#141414]">
        <div className="border-b border-yellow-500/20 p-6">
          <h1 className="text-2xl font-bold text-yellow-400">
            <SiteName />
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            لوحة التحكم
          </p>
        </div>

        <nav className="space-y-2 p-4">
          <Link
            href="/admin"
            className="block rounded-lg px-4 py-3 transition hover:bg-yellow-500 hover:text-black"
          >
            🏠 الرئيسية
          </Link>

          <Link
            href="/admin/orders"
            className="block rounded-lg px-4 py-3 transition hover:bg-yellow-500 hover:text-black"
          >
            🧾 الطلبات
          </Link>

          <Link
            href="/admin/menu"
            className="block rounded-lg px-4 py-3 transition hover:bg-yellow-500 hover:text-black"
          >
            🍽️ المنيو
          </Link>

          <Link
            href="/admin/categories"
            className="block rounded-lg px-4 py-3 transition hover:bg-yellow-500 hover:text-black"
          >
            📂 التصنيفات
          </Link>

          <Link
            href="/admin/tables"
            className="block rounded-lg px-4 py-3 transition hover:bg-yellow-500 hover:text-black"
          >
            🪑 الطاولات
          </Link>

          <div className="my-4 border-t border-zinc-800" />

          <Link
            href="/admin/settings"
            className="block rounded-lg border border-yellow-500/20 px-4 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
          >
            ⚙️ إعدادات المقهى
          </Link>
        </nav>
      </aside>

      <section className="min-w-0 flex-1 overflow-auto p-8">
        {children}
      </section>
    </div>
  );
}