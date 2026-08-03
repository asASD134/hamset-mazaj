"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { menuCategories } from "@/data/menu";
import { useTable } from "@/context/TableContext";

export default function FeaturedProducts() {
  const { hasTable, tableNumber } = useTable();

  const products = menuCategories
    .flatMap((category) => category.items)
    .filter((item) => item.featured)
    .slice(0, 6);

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <span className="font-bold tracking-widest text-yellow-400">
            الأكثر طلباً
          </span>

          <h2 className="mt-3 text-4xl font-black text-white">
            منتجاتنا المميزة
          </h2>

          <p className="mt-4 text-zinc-400">
            استمتع بأفضل المشروبات والحلويات المختارة بعناية.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10"
              >
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                    <Star size={15} fill="currentColor" />
                    مميز
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <h3 className="text-2xl font-bold text-white">
                    {item.name}
                  </h3>

                  <p className="line-clamp-2 min-h-[48px] text-zinc-400">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-yellow-400">
                      {item.price} ر.س
                    </span>

                    <Link
                      href={withTable("/menu")}
                      className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black transition-all duration-300 hover:bg-yellow-400"
                    >
                      عرض المنتج
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">
              لا توجد منتجات مميزة حالياً.
            </p>
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href={withTable("/menu")}
            className="inline-flex rounded-2xl border-2 border-yellow-500 px-8 py-4 text-lg font-bold text-yellow-400 transition-all duration-300 hover:bg-yellow-500 hover:text-black"
          >
            عرض المنيو بالكامل
          </Link>
        </div>
      </div>
    </section>
  );
}