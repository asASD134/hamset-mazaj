import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import HomeSettingsPanel from "@/components/admin/settings/HomeSettingsPanel";
import ContactSettingsPanel from "@/components/admin/settings/ContactSettingsPanel";

export default async function PlatformSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isSystemAdmin } = await supabase.rpc("is_system_admin");
  if (!isSystemAdmin) redirect("/admin");

  return (
    <main dir="rtl" className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#171207] via-[#0c0d12] to-[#07080b] p-6 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-black text-yellow-400">الإدارة العامة</div>
              <h1 className="mt-1 text-3xl font-black">المقهى الرئيسي — الإعدادات الكاملة</h1>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-zinc-400">
                هذه الصفحة هي النسخة الرئيسية التي نطوّر منها نظام المقاهي. نعرض هنا نفس واجهات إعدادات الموقع الأساسية، بينما تُحفظ بيانات كل مقهى بشكل مستقل عند العمل من حسابه الخاص.
              </p>
            </div>

            <a
              href="/admin/cafes"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400"
            >
              العودة إلى إدارة المقاهي
            </a>
          </div>
        </header>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-[#121212] p-1">
            <HomeSettingsPanel />
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#121212] p-1">
            <ContactSettingsPanel />
          </section>
        </div>
      </div>
    </main>
  );
}
