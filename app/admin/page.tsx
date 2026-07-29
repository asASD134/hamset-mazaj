export default function DashboardPage() {
  return (
    <div className="min-h-screen flex">

      {/* القائمة الجانبية */}
      <aside className="w-72 bg-zinc-900 border-l border-yellow-500/20 p-6">

        <h1 className="text-3xl font-bold text-yellow-400 mb-10">
          ☕ همسة مزاج
        </h1>

        <nav className="space-y-4">

          <button className="w-full text-right p-3 rounded-xl hover:bg-zinc-800">
            🏠 الرئيسية
          </button>

          <button className="w-full text-right p-3 rounded-xl hover:bg-zinc-800">
            ☕ إدارة المنيو
          </button>

          <button className="w-full text-right p-3 rounded-xl hover:bg-zinc-800">
            🖼️ إدارة المعرض
          </button>

          <button className="w-full text-right p-3 rounded-xl hover:bg-zinc-800">
            ⚽ إدارة المباريات
          </button>

          <button className="w-full text-right p-3 rounded-xl hover:bg-zinc-800">
            📞 التواصل
          </button>

          <button className="w-full text-right p-3 rounded-xl hover:bg-zinc-800">
            ⚙️ الإعدادات
          </button>

        </nav>

      </aside>

      {/* المحتوى */}
      <section className="flex-1 p-10">

        <h2 className="text-4xl font-bold text-yellow-400 mb-6">
          لوحة التحكم
        </h2>

        <p className="text-gray-300">
          مرحبًا بك في لوحة تحكم مقهى همسة مزاج.
        </p>

      </section>

    </div>
  );
}