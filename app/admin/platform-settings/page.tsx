import Link from "next/link";
import { Globe2, Phone, Settings2 } from "lucide-react";

export default function PlatformSettingsPage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white md:p-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-[#171207] via-[#0c0d12] to-[#07080b] p-7 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black">
              <Settings2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-yellow-400">إدارة المنصة العامة</h1>
              <p className="mt-2 text-zinc-400">كل إعدادات التحديث العام في مكان واحد.</p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <Link href="/admin/platform?platform=1" className="rounded-[2rem] border border-yellow-500/30 bg-yellow-500/10 p-6 transition hover:bg-yellow-500/15">
            <div className="flex items-center gap-3 text-yellow-400">
              <Settings2 size={24} />
              <h2 className="text-xl font-black">الإعدادات الكاملة القابلة للتحرير</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-zinc-400">افتح النسخة الرئيسية الكاملة من إعدادات الموقع. بيانات التواصل أيضًا تحتوي على حقول كتابة فعلية وليست مجرد إظهار وإخفاء.</p>
          </Link>

          <Link href="/admin/settings/contact?platform=1" className="rounded-[2rem] border border-white/10 bg-[#121212] p-6 transition hover:border-yellow-500/40">
            <div className="flex items-center gap-3 text-yellow-400">
              <Phone size={24} />
              <h2 className="text-xl font-black">بيانات التواصل والروابط</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-zinc-500">الهاتف، واتساب، البريد، العنوان، الخريطة، أوقات العمل، وإضافة وتعديل مواقع التواصل.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-black text-black">
              <Globe2 size={16} /> فتح الإعدادات
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
