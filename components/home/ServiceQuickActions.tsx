"use client";

import Link from "next/link";
import {
  BellRing,
  Coffee,
  Receipt,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useTable } from "@/context/TableContext";

const services = [
  {
    title: "استدعاء النادل",
    icon: UserRound,
    color: "bg-yellow-500 text-black",
    href: "/service?type=waiter",
  },
  {
    title: "طلب فحم",
    icon: Sparkles,
    color: "bg-orange-500 text-white",
    href: "/service?type=charcoal",
  },
  {
    title: "طلب ماء",
    icon: Coffee,
    color: "bg-sky-500 text-white",
    href: "/service?type=water",
  },
  {
    title: "طلب الحساب",
    icon: Receipt,
    color: "bg-emerald-500 text-white",
    href: "/service?type=bill",
  },
];

export default function ServiceQuickActions() {
  const { hasTable, tableNumber } = useTable();

  if (!hasTable) return null;

  const withTable = (path: string) =>
    `${path}${path.includes("?") ? "&" : "?"}table=${tableNumber}`;

  return (
    <section className="bg-[#0b0b0b] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex rounded-full bg-yellow-500/10 p-4 text-yellow-400">
            <BellRing size={34} />
          </div>

          <h2 className="text-4xl font-black text-white">
            خدمات الطاولة
          </h2>

          <p className="mt-4 text-zinc-400">
            اختر الخدمة المطلوبة وسيتم إشعار الموظف مباشرة.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.title}
                href={withTable(service.href)}
                className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-yellow-500"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${service.color}`}
                >
                  <Icon size={30} />
                </div>

                <h3 className="mb-3 text-2xl font-bold text-white">
                  {service.title}
                </h3>

                <p className="text-zinc-400">
                  اضغط لإرسال الطلب مباشرة إلى الموظف.
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}