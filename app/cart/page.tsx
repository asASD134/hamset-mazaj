"use client";

import { useState } from "react";
import { ShoppingCart, CheckCircle2 } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useTable } from "@/context/TableContext";

import {
  CartItem,
  CartSummary,
} from "@/modules/cart/components";

import { getCartTotal } from "@/modules/cart";

import { CheckoutButton } from "@/modules/orders/components";

import { createOrder } from "@/modules/orders";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    clearCart,
  } = useCart();

  const { tableNumber } = useTable();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const total = getCartTotal(items);

  async function handleCheckout() {
    if (!tableNumber) {
      setMessage("❌ يجب الدخول عن طريق QR الخاص بالطاولة.");
      return;
    }

    try {
      setLoading(true);

      await createOrder(
        tableNumber,
        items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      );

      clearCart();

      setMessage(`✅ تم إرسال طلب الطاولة رقم ${tableNumber} بنجاح.`);
    } catch (error: any) {
      console.error(error);

      setMessage(
        error?.message ??
          "حدث خطأ أثناء إرسال الطلب."
      );
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-zinc-950 to-black px-6 text-white">
        <div className="text-center">

          <ShoppingCart
            size={80}
            className="mx-auto text-yellow-400"
          />

          <h1 className="mt-6 text-4xl font-bold">
            السلة فارغة
          </h1>

          <p className="mt-3 text-gray-400">
            لم تقم بإضافة أي منتج بعد.
          </p>

          {message && (
            <p className="mt-6 font-bold text-red-400">
              {message}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black py-14 text-white">

      <div className="mx-auto max-w-5xl px-6">

        <div className="mb-10 rounded-3xl border border-yellow-500 bg-yellow-500/10 p-6">

          <h1 className="text-center text-4xl font-bold text-yellow-400">
            🛒 سلة الطلب
          </h1>

          <p className="mt-3 text-center text-gray-300">
            رقم الطاولة:
            <span className="mr-2 font-bold text-yellow-400">
              {tableNumber}
            </span>
          </p>

        </div>

        <div className="space-y-5">
          {items.map((item) => (
            <CartItem
              key={item.id}
              image={item.image}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </div>

        <div className="mt-10">
          <CartSummary
            total={total}
            onClear={clearCart}
          />
        </div>

        <div className="mt-8">
          <CheckoutButton
            onCheckout={handleCheckout}
          />
        </div>

        {loading && (
          <div className="mt-8 text-center font-bold text-yellow-400">
            ⏳ جاري إرسال الطلب...
          </div>
        )}

        {message && (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-green-600 bg-green-600/10 p-4 text-green-400">
            <CheckCircle2 size={24} />
            <span className="font-bold">{message}</span>
          </div>
        )}

      </div>

    </main>
  );
}