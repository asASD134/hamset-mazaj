"use client";

import Link from "next/link";

import {
  BellRing,
  Coffee,
  Receipt,
  Sparkles,
  UserRound,
  ArrowLeft,
} from "lucide-react";

import { useTable } from "@/context/TableContext";

const services = [
  {
    type: "waiter",
    title: "استدعاء النادل",
    description: "اطلب مساعدة الموظف مباشرة.",
    icon: UserRound,
  },
  {
    type: "charcoal",
    title: "طلب فحم",
    description: "أرسل طلب الفحم إلى الموظف.",
    icon: Sparkles,
  },
  {
    type: "water",
    title: "طلب ماء",
    description: "اطلب الماء بسهولة من طاولتك.",
    icon: Coffee,
  },
  {
    type: "bill",
    title: "طلب الحساب",
    description: "اطلب الحساب عندما تكون جاهزًا.",
    icon: Receipt,
  },
];

export default function ServiceQuickActions() {
  const { hasTable, tableNumber } =
    useTable();

  if (!hasTable) {
    return null;
  }

  const withTable = (type: string) =>
    `/service?type=${type}&table=${tableNumber}`;

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-[#090909] py-16 sm:py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

        {/* رأس القسم */}
        <div className="mb-10 flex flex-col items-center text-center">

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
            <BellRing size={26} />
          </div>

          <span className="text-xs font-bold tracking-[0.2em] text-yellow-400 sm:text-sm">
            خدمة الطاولة
          </span>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            اطلب خدمتك بسهولة
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            أنت الآن على الطاولة رقم{" "}
            <span className="font-bold text-yellow-400">
              {tableNumber}
            </span>
            . اختر الخدمة التي تحتاجها وسيصل الطلب للموظف مباشرة.
          </p>

        </div>

        {/* الخدمات */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.type}
                href={withTable(
                  service.type
                )}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/30 hover:bg-yellow-500/[0.04]"
              >
                <div className="flex items-start justify-between gap-4">

                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 transition-all duration-300 group-hover:bg-yellow-500 group-hover:text-black">
                    <Icon size={24} />
                  </div>

                  <ArrowLeft
                    size={18}
                    className="mt-2 text-zinc-600 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-yellow-400"
                  />

                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  {service.description}
                </p>

              </Link>
            );
          })}

        </div>
      </div>
    </section>
  );
}