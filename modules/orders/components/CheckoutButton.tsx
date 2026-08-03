"use client";

import { ArrowLeft, CreditCard } from "lucide-react";

type CheckoutButtonProps = {
  onCheckout: () => void;
  disabled?: boolean;
};

export default function CheckoutButton({
  onCheckout,
  disabled,
}: CheckoutButtonProps) {
  return (
    <button
      onClick={onCheckout}
      disabled={disabled}
      className="group relative w-full overflow-hidden rounded-[28px] bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-5 text-black shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-yellow-500/30 active:scale-95"
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative flex items-center justify-center gap-4">

        <div className="rounded-2xl bg-black/10 p-3">
          <CreditCard size={24} />
        </div>

        <span className="text-xl font-black">
          تأكيد وإرسال الطلب
        </span>

        <ArrowLeft
          size={22}
          className="transition-transform duration-300 group-hover:-translate-x-1"
        />

      </div>

    </button>
  );
}
