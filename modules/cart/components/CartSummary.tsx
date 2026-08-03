"use client";

import {
  Wallet,
  Trash2,
  ShoppingBag,
} from "lucide-react";

type CartSummaryProps = {
  total: number;
  onClear: () => void;
};

export default function CartSummary({
  total,
  onClear,
}: CartSummaryProps) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-zinc-900 to-black">

      <div className="border-b border-yellow-500/10 p-8">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-yellow-500/10 p-4">
            <Wallet
              size={32}
              className="text-yellow-400"
            />
          </div>

          <div>

            <h2 className="text-3xl font-black text-white">
              ملخص الطلب
            </h2>

            <p className="mt-1 text-zinc-400">
              راجع قيمة الطلب قبل الإرسال.
            </p>

          </div>

        </div>

      </div>

      <div className="p-8">

        <div className="mb-8 flex items-center justify-between rounded-3xl border border-yellow-500/10 bg-zinc-800/40 p-6">

          <div className="flex items-center gap-3">

            <ShoppingBag
              size={24}
              className="text-yellow-400"
            />

            <span className="text-xl font-bold text-white">
              إجمالي الطلب
            </span>

          </div>

          <span className="text-4xl font-black text-yellow-400">
            {total} ر.س
          </span>

        </div>

        <button
          onClick={onClear}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500 bg-red-600 px-6 py-4 text-lg font-black text-white transition-all duration-300 hover:scale-[1.02] hover:bg-red-700 active:scale-95"
        >
          <Trash2 size={22} />
          إفراغ السلة
        </button>

      </div>

    </section>
  );
}