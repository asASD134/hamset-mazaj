import Link from "next/link";

export default function PlatformSettingsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#050505] p-6 text-white">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[#121212] p-7">
        <h1 className="text-3xl font-black text-yellow-400">إدارة المنصة العامة</h1>
        <p className="mt-3 leading-8 text-zinc-400">
          الإدارة العامة هي المرجع الرئيسي لنظام الموقع. ابدأ بتوحيد النظام من همسة مزاج، ثم استخدم صفحة الإعدادات الكاملة لأي تطوير جديد.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/platform-settings/sync-from-hamset"
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 transition hover:bg-yellow-500/20"
          >
            <h2 className="text-xl font-black text-yellow-300">توحيد النظام</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-400">اجعل همسة مزاج المرجع الأساسي مرة واحدة لتوحيد البنية والميزات في جميع المواقع.</p>
          </Link>

          <Link
            href="/admin/settings?platform=1"
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-yellow-500/30"
          >
            <h2 className="text-xl font-black text-white">الإعدادات الكاملة</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-400">افتح نفس صفحة إعدادات الموقع الكاملة لتعديل النظام العام ومحتوى المرجع.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
