"use client";

import Link from "next/link";

const actions = [
  {
    title: "إدارة الطاولات",
    description: "إضافة وتعديل وحذف الطاولات",
    href: "/admin/tables",
    icon: "🍽️",
  },
  {
    title: "إدارة المنيو",
    description: "المنتجات والأقسام",
    href: "/admin/menu",
    icon: "☕",
  },
  {
    title: "إدارة الطلبات",
    description: "متابعة الطلبات الحالية",
    href: "/admin/orders",
    icon: "📦",
  },
  {
    title: "إدارة المسابقات",
    description: "إضافة وإخفاء وترتيب أي دوري أو كأس",
    href: "/admin/football-competitions",
    icon: "⚽",
  },
  {
    title: "إعدادات النظام",
    description: "إعدادات المقهى",
    href: "/admin/settings",
    icon: "⚙️",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6">
      <h2 className="mb-6 text-2xl font-bold text-yellow-400">
        اختصارات سريعة
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-zinc-800 bg-black/40 p-5 transition hover:border-yellow-500 hover:bg-black/60"
          >
            <div className="mb-3 text-4xl">
              {action.icon}
            </div>

            <h3 className="text-xl font-bold text-white">
              {action.title}
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}