"use client";

import { ShoppingCart, Eye, Star } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useTable } from "@/context/TableContext";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export default function MenuCard({
  item,
}: {
  item: MenuItem;
}) {
  const { hasTable } = useTable();
  const { addToCart } = useCart();

  return (
    <article className="group overflow-hidden rounded-[32px] border border-yellow-500/10 bg-gradient-to-b from-zinc-900 to-black transition-all duration-500 hover:-translate-y-2 hover:border-yellow-500/40 hover:shadow-2xl hover:shadow-yellow-500/10">

      <div className="relative overflow-hidden">

        <img
          src={item.image}
          alt={item.name}
          className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute right-5 top-5 rounded-full bg-yellow-500 px-4 py-2 text-lg font-black text-black shadow-lg">
          {item.price} ر.س
        </div>

        <div className="absolute left-5 top-5 flex items-center gap-1 rounded-full bg-black/70 px-3 py-2 text-yellow-400 backdrop-blur">
          <Star size={16} fill="currentColor" />
          <span className="text-sm font-bold">
            مميز
          </span>
        </div>

      </div>

      <div className="p-7">

        <h3 className="mb-4 text-3xl font-black text-white transition group-hover:text-yellow-400">
          {item.name}
        </h3>

        <p className="min-h-[84px] leading-8 text-zinc-400">
          {item.description}
        </p>

        <div className="mt-8 flex items-center justify-between">

          <div>
            <p className="text-sm text-zinc-500">
              السعر
            </p>

            <p className="text-3xl font-black text-yellow-400">
              {item.price} ر.س
            </p>
          </div>

          {hasTable ? (
            <button
              onClick={() =>
                addToCart({
                  id: item.id,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  quantity: 1,
                })
              }
              className="flex items-center gap-3 rounded-2xl bg-yellow-500 px-6 py-4 text-lg font-black text-black transition hover:scale-105 hover:bg-yellow-400 active:scale-95"
            >
              <ShoppingCart size={22} />
              إضافة للسلة
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-6 py-4 text-zinc-300">
              <Eye size={20} />
              عرض فقط
            </div>
          )}

        </div>

      </div>

    </article>
  );
}