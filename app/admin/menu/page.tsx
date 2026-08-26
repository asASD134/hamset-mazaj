"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

export default function AdminMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPlatform = searchParams.get("platform") === "1";

  useEffect(() => {
    if (isPlatform) router.replace("/admin?platform=1#menu");
  }, [isPlatform, router]);

  if (isPlatform) {
    return (
      <main dir="rtl" className="min-h-screen bg-black p-8 text-white">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 px-10 py-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
              <UtensilsCrossed size={28} />
            </div>
            <h1 className="text-xl font-black text-white">جاري فتح منيو الإدارة العامة...</h1>
            <p className="mt-2 text-sm text-zinc-500">سيتم فتح قسم المنيو داخل مركز التحكم الرئيسي.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-900 p-8">
        <h1 className="text-3xl font-black text-yellow-400">إدارة المنيو</h1>
        <p className="mt-3 text-zinc-400">استخدم مركز التحكم الخاص بالمقهى للوصول إلى إدارة المنتجات والتصنيفات.</p>
        <a href="/admin" className="mt-6 inline-flex rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400">العودة إلى لوحة الإدارة</a>
      </div>
    </main>
  );
}
