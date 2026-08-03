"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ShoppingBag, Bell } from "lucide-react";
import { useTable } from "@/context/TableContext";

export default function Hero() {
  const { hasTable, tableNumber } = useTable();

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  return (
    <section className="relative h-[calc(100vh-96px)] overflow-hidden">

      {/* Background */}

      <Image
        src="/images/cafe.jpg"
        alt="Hamset Mazaj"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Overlay */}

      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#0d0d0d]" />

      {/* Hero Content */}

      <div className="relative z-10 flex h-full w-full items-center justify-center">

        <div className="flex w-full max-w-7xl flex-col items-center px-6 text-center translate-y-16">

          <Image
            src="/images/logo.png"
            alt="Hamset Mazaj Logo"
            width={170}
            height={170}
            priority
            className="mb-6 object-contain drop-shadow-2xl"
          />

          <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-5 py-2 text-sm font-bold tracking-widest text-yellow-400 backdrop-blur">
            Premium Coffee & Lounge
          </span>

          <h1 className="mt-6 text-5xl font-black text-white md:text-7xl">
            همسة مزاج
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300 md:text-2xl">
            تجربة فاخرة تجمع بين القهوة المختصة،
            الشيشة الفاخرة،
            الحلويات،
            المشروبات،
            ومتابعة أهم المباريات داخل أجواء راقية.
          </p>

          {hasTable && (
            <div className="mt-8 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-8 py-4 shadow-lg backdrop-blur-md">
              <p className="text-xl font-bold text-yellow-400">
                الطاولة رقم {tableNumber}
              </p>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">

            <Link
              href={withTable("/menu")}
              className="flex items-center gap-3 rounded-2xl bg-yellow-500 px-9 py-4 text-lg font-bold text-black transition duration-300 hover:scale-105 hover:bg-yellow-400"
            >
              <ShoppingBag size={22} />
              {hasTable ? "اطلب الآن" : "تصفح المنيو"}
            </Link>

            {hasTable && (
              <Link
                href={withTable("/service")}
                className="flex items-center gap-3 rounded-2xl border border-yellow-500 px-9 py-4 text-lg font-bold text-yellow-400 transition duration-300 hover:bg-yellow-500 hover:text-black"
              >
                <Bell size={22} />
                خدمات الطاولة
              </Link>
            )}
                      </div>

          <div className="mt-20 flex flex-col items-center animate-bounce text-zinc-400">
            <ChevronDown size={30} />

            <span className="mt-2 text-sm">
              اسحب للأسفل
            </span>
          </div>

        </div>

      </div>

    </section>
  );
}