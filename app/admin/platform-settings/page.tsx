import ContactSettingsPanel from "@/components/admin/settings/ContactSettingsPanel";

export default function PlatformSettingsPage() {
  return (
    <main className="min-h-screen bg-[#050505] p-4 text-white md:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-[#171207] via-[#0c0d12] to-[#07080b] p-7 shadow-2xl">
          <h1 className="text-3xl font-black text-yellow-400">إدارة المنصة العامة</h1>
          <p className="mt-2 leading-7 text-zinc-400">
            هذه الصفحة هي واجهة التعديل العامة. كل خانة في بيانات التواصل قابلة للكتابة والتعديل والحفظ، وعند فتحها بهذا المسار يتم نشر التغييرات إلى المواقع الحالية.
          </p>
        </header>

        <ContactSettingsPanel />
      </div>
    </main>
  );
}
