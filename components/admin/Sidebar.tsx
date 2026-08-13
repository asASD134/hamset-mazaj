"use client";

import Link from "next/link";
import SiteName from "@/components/SiteName";

export default function Sidebar() {
  const menuItems = [
    { icon: "🏠", title: "الرئيسية", href: "/admin" },
    { icon: "☕", title: "إدارة المنيو", href: "/admin/menu" },
    { icon: "🖼️", title: "إدارة المعرض", href: "/admin/gallery" },
    { icon: "⚽", title: "إدارة المباريات", href: "/admin/matches" },
    { icon: "🎁", title: "إدارة العروض", href: "/admin/offers" },
    { icon: "📞", title: "معلومات التواصل", href: "/admin/contact" },
    { icon: "⚙️", title: "إعدادات المقهى", href: "/admin/settings" },
  ];

  return (
    <aside
      dir="rtl"
      className="min-h-screen w-72 border-l border-yellow-500/20 bg-zinc-900 p-6"
    >
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-yellow-400">
          ☕ <SiteName />
        </h1>
      </div>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all duration-300 hover:bg-yellow-400 hover:text-black"
          >
            <span className="text-2xl">{item.icon}</span>

            <span className="font-semibold">
              {item.title}
            </span>
          </Link>
        ))}

        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all duration-300 hover:bg-red-500 hover:text-white"
        >
          <span className="text-2xl">🚪</span>

          <span className="font-semibold">
            العودة للموقع
          </span>
        </Link>
      </nav>
    </aside>
  );
}