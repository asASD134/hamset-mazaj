import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import HomeSettingsPanel from "@/components/admin/settings/HomeSettingsPanel";
import ContactSettingsPanel from "@/components/admin/settings/ContactSettingsPanel";

export default async function PlatformSettingsFullPage() {
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
        <header className="mb-6 rounded-3xl border border-yellow-500/20 bg-[#121212] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-black text-yellow-400">الإدارة العامة</div>
              <h1 className="mt-1 text-3xl font-black">إعدادات الموقع الكاملة</h1>
              <p className="mt-2 text-sm leading-7 text-zinc-500">
                هذه الصفحة تعمل كنسخة الإدارة الرئيسية للموقع. كل حفظ هنا يستخدم وضع المنصة وينشر التحديثات إلى المقاهي الحالية، كما تُستخدم آخر إعدادات المنصة عند إنشاء المقاهي الجديدة.
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
          <section>
            <HomeSettingsPanel />
          </section>

          <section>
            <ContactSettingsPanel />
          </section>
        </div>
      </div>
    </main>
  );
}
