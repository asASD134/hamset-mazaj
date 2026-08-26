import ContactSettingsPanel from "@/components/admin/settings/ContactSettingsPanel";

export default function ContactSettingsPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-6 text-white sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl border border-yellow-500/20 bg-[#121212] p-6">
          <h1 className="text-3xl font-black text-yellow-400">إعدادات التواصل</h1>
          <p className="mt-2 text-sm text-zinc-500">
            تحكم فعلي في بيانات التواصل والروابط. عند فتح الصفحة من الإدارة العامة ينتشر التعديل إلى المواقع الحالية والجديدة.
          </p>
        </header>
        <ContactSettingsPanel />
      </div>
    </main>
  );
}
