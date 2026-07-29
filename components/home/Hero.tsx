"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useTable } from "@/context/TableContext";

export default function Hero() {
  const { hasTable, tableNumber } = useTable();

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* الخلفية */}
      <Image
        src="/images/cafe.jpg"
        alt="همسة مزاج"
        fill
        priority
        className="object-cover"
      />

      {/* طبقة شفافة */}
      <div className="absolute inset-0 bg-black/40" />

      {/* المحتوى */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center text-white">

        {/* الشعار */}
        <Image
          src="/images/logo.png"
          alt="همسة مزاج"
          width={220}
          height={220}
          priority
          className="mb-6"
        />

        <h1 className="text-5xl md:text-7xl font-extrabold text-yellow-400">
          همسة مزاج
        </h1>

        <p className="mt-6 max-w-3xl text-lg md:text-2xl text-gray-200">
          أفضل القهوة • الشيشة • الحلويات • جلسات راقية • متابعة أهم المباريات
        </p>

        {hasTable ? (
          <>
            <div className="mt-10 rounded-2xl border border-yellow-500 bg-black/50 px-8 py-5">
              <h2 className="text-3xl font-bold text-yellow-400">
                الطاولة رقم {tableNumber}
              </h2>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <Link
                href={withTable("/menu")}
                className="flex items-center gap-2 rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-black hover:bg-yellow-400 transition"
              >
                <ShoppingBag size={22} />
                طلب جديد
              </Link>

              <Link
                href={withTable("/cart")}
                className="flex items-center gap-2 rounded-xl border-2 border-yellow-500 px-8 py-4 text-lg font-bold text-yellow-400 hover:bg-yellow-500 hover:text-black transition"
              >
                <ShoppingCart size={22} />
                السلة
              </Link>

            </div>
          </>
        ) : (
          <div className="mt-10">
            <Link
              href="/menu"
              className="rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-black hover:bg-yellow-400 transition"
            >
              تصفح المنيو
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}