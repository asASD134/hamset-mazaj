import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#141414] border-l border-yellow-500/20">
        <div className="p-6 border-b border-yellow-500/20">
          <h1 className="text-2xl font-bold text-yellow-400">
            همسة مزاج
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            لوحة التحكم
          </p>
        </div>

        <nav className="p-4 space-y-2">

          <Link
            href="/admin"
            className="block rounded-lg px-4 py-3 hover:bg-yellow-500 hover:text-black transition"
          >
            🏠 الرئيسية
          </Link>

          <Link
            href="/admin/orders"
            className="block rounded-lg px-4 py-3 hover:bg-yellow-500 hover:text-black transition"
          >
            🧾 الطلبات
          </Link>

          <Link
            href="/admin/menu"
            className="block rounded-lg px-4 py-3 hover:bg-yellow-500 hover:text-black transition"
          >
            🍽️ المنيو
          </Link>

          <Link
            href="/admin/categories"
            className="block rounded-lg px-4 py-3 hover:bg-yellow-500 hover:text-black transition"
          >
            📂 التصنيفات
          </Link>

          <Link
            href="/admin/tables"
            className="block rounded-lg px-4 py-3 hover:bg-yellow-500 hover:text-black transition"
          >
            🪑 الطاولات
          </Link>

        </nav>
      </aside>

      {/* Content */}

      <section className="flex-1 p-8 overflow-auto">
        {children}
      </section>
    </div>
  );
}