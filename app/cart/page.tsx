"use client";

import { useRef, useState } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const requestIdRef = useRef(crypto.randomUUID());

  const total = getCartTotal(items);

  async function handleCheckout() {
    if (loading) return;

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
        })),
        requestIdRef.current
      );

      clearCart();

      requestIdRef.current = crypto.randomUUID();

      setMessage(
        `✅ تم إرسال طلب الطاولة رقم ${tableNumber} بنجاح.`
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إرسال الطلب."
      );
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="max-w-md rounded-[32px] border border-yellow-500/20 bg-zinc-900 p-12 text-center">
          <ShoppingBag
            size={80}
            className="mx-auto text-yellow-400"
          />

          <h1 className="mt-8 text-4xl font-black text-white">
            السلة فارغة
          </h1>

          <p className="mt-5 leading-8 text-zinc-400">
            لم تقم بإضافة أي منتج حتى الآن.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-r from-yellow-500 to-yellow-600 p-10 text-black">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-5xl font-black">
                سلة الطلب
              </h1>

              <p className="mt-3 text-lg font-semibold">
                الطاولة رقم {tableNumber}
              </p>
            </div>

            <div className="rounded-2xl bg-black/10 px-8 py-5 text-center backdrop-blur">
              <p className="text-sm font-semibold">
                الإجمالي
              </p>

              <p className="mt-2 text-4xl font-black">
                {total} ر.س
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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

        <div className="mt-10 rounded-[32px] border border-yellow-500/20 bg-zinc-900 p-8">
          <div className="mb-8 flex items-center gap-4">
            <CreditCard
              size={34}
              className="text-yellow-400"
            />

            <div>
              <h2 className="text-2xl font-black text-white">
                تأكيد الطلب
              </h2>

              <p className="text-zinc-400">
                بعد الضغط على الزر سيتم إرسال الطلب مباشرة إلى موظفي المقهى.
              </p>
            </div>
          </div>

          <CheckoutButton
            onCheckout={handleCheckout}
            disabled={loading}
          />

          {loading && (
            <div className="mt-8 text-center text-lg font-bold text-yellow-400">
              ⏳ جاري إرسال الطلب...
            </div>
          )}

          {message && (
            <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-green-400">
              <CheckCircle2 size={26} />

              <span className="font-bold">
                {message}
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}