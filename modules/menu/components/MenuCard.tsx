"use client";

import { ShoppingCart, Eye } from "lucide-react";

import { useTable } from "@/context/TableContext";
import { useCart } from "@/context/CartContext";

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
    <div className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/10">

      <div className="relative h-60 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full bg-yellow-500 px-4 py-1 text-sm font-bold text-black shadow-lg">
          {item.price} ر.س
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-3 text-2xl font-bold text-yellow-400">
          {item.name}
        </h3>

        <p className="min-h-[72px] leading-7 text-gray-300">
          {item.description}
        </p>

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
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 py-3 text-lg font-bold text-black transition hover:bg-yellow-400"
          >
            <ShoppingCart size={22} />
            إضافة إلى السلة
          </button>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 py-3 text-gray-300">
            <Eye size={20} />
            عرض فقط
          </div>
        )}
      </div>
    </div>
  );
}