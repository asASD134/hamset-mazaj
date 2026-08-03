"use client";

import { Trash2, Package2 } from "lucide-react";

type CartItemProps = {
  image: string;
  name: string;
  price: number;
  quantity: number;
  onRemove: () => void;
};

export default function CartItem({
  image,
  name,
  price,
  quantity,
  onRemove,
}: CartItemProps) {
  return (
    <article className="group overflow-hidden rounded-[30px] border border-yellow-500/20 bg-gradient-to-r from-zinc-900 to-[#111111] p-5 transition-all duration-300 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10">

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-5">

          <div className="overflow-hidden rounded-3xl">

            <img
              src={image}
              alt={name}
              className="h-28 w-28 object-cover transition duration-500 group-hover:scale-110"
            />

          </div>

          <div>

            <h2 className="text-2xl font-black text-white">
              {name}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-4">

              <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2">

                <Package2
                  size={18}
                  className="text-yellow-400"
                />

                <span className="font-bold text-yellow-400">
                  الكمية: {quantity}
                </span>

              </div>

              <div className="rounded-full bg-zinc-800 px-4 py-2">

                <span className="text-lg font-black text-white">
                  {price} ر.س
                </span>

              </div>

            </div>

          </div>

        </div>

        <button
          onClick={onRemove}
          className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:scale-105 hover:bg-red-700 active:scale-95"
        >
          <Trash2 size={20} />
          حذف المنتج
        </button>

      </div>

    </article>
  );
}