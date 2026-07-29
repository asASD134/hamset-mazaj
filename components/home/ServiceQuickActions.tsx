"use client";

import Link from "next/link";
import {
  Bell,
  Droplets,
  Flame,
  Receipt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useTable } from "@/context/TableContext";

export default function ServiceQuickActions() {
  const { hasTable, tableNumber } = useTable();

  if (!hasTable) return null;

  const withTable = (type: string) =>
    `/service?table=${tableNumber}&type=${type}`;

  const buttons = [
    {
      title: "طلب الطعام",
      icon: <UtensilsCrossed size={30} />,
      color: "bg-yellow-500 hover:bg-yellow-400 text-black",
      href: `/menu?table=${tableNumber}`,
    },
    {
      title: "استدعاء موظف",
      icon: <Bell size={30} />,
      color: "bg-green-600 hover:bg-green-500 text-white",
      href: withTable("call_waiter"),
    },
    {
      title: "طلب ماء",
      icon: <Droplets size={30} />,
      color: "bg-blue-600 hover:bg-blue-500 text-white",
      href: withTable("water"),
    },
    {
      title: "طلب فحم",
      icon: <Flame size={30} />,
      color: "bg-orange-600 hover:bg-orange-500 text-white",
      href: withTable("charcoal"),
    },
    {
      title: "تنظيف الطاولة",
      icon: <Sparkles size={30} />,
      color: "bg-purple-600 hover:bg-purple-500 text-white",
      href: withTable("clean_table"),
    },
    {
      title: "طلب الحساب",
      icon: <Receipt size={30} />,
      color: "bg-red-600 hover:bg-red-500 text-white",
      href: withTable("bill"),
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-yellow-400">
          خدمات الطاولة
        </h2>

        <p className="mt-2 text-gray-400">
          اختر الخدمة المطلوبة وسيصل الطلب مباشرة للموظف.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {buttons.map((button) => (
          <Link
            key={button.title}
            href={button.href}
            className={`${button.color} flex min-h-[150px] flex-col items-center justify-center rounded-3xl shadow-xl transition duration-300 hover:scale-105`}
          >
            {button.icon}

            <span className="mt-4 text-lg font-bold">
              {button.title}
            </span>
          </Link>
        ))}
      </div>

    </section>
  );
}