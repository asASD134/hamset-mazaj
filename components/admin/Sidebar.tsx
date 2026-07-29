export default function Sidebar() {
  const menuItems = [
    { icon: "🏠", title: "الرئيسية" },
    { icon: "☕", title: "إدارة المنيو" },
    { icon: "🖼️", title: "إدارة المعرض" },
    { icon: "⚽", title: "إدارة المباريات" },
    { icon: "🎁", title: "إدارة العروض" },
    { icon: "📞", title: "معلومات التواصل" },
    { icon: "⚙️", title: "الإعدادات" },
    { icon: "🚪", title: "تسجيل الخروج" },
  ];

  return (
    <aside className="w-72 min-h-screen bg-zinc-900 border-l border-yellow-500/20 p-6">

      <h1 className="text-3xl font-bold text-yellow-400 text-center mb-10">
        ☕ همسة مزاج
      </h1>

      <nav className="space-y-3">

        {menuItems.map((item) => (
          <button
            key={item.title}
            className="w-full flex items-center gap-3 text-right p-4 rounded-xl hover:bg-yellow-400 hover:text-black transition-all duration-300"
          >
            <span className="text-2xl">{item.icon}</span>

            <span className="font-semibold">
              {item.title}
            </span>
          </button>
        ))}

      </nav>

    </aside>
  );
}