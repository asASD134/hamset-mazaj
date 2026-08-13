"use client";

import { useRef, useState } from "react";

import {
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

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const requestIdRef = useRef(
    crypto.randomUUID()
  );

  const total =
    getCartTotal(items);

  async function handleCheckout() {
    if (loading) {
      return;
    }

    if (!tableNumber) {
      setMessage(
        "❌ يجب الدخول عن طريق QR الخاص بالطاولة."
      );

      return;
    }

    if (items.length === 0) {
      setMessage(
        "❌ السلة فارغة."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await createOrder({
        tableNumber: Number(
          tableNumber
        ),

        items: items.map((item) => ({
          menuItemId: String(
            item.id
          ),

          quantity:
            Number(item.quantity),

          price:
            Number(item.price),
        })),
      });

      clearCart();

      requestIdRef.current =
        crypto.randomUUID();

      setMessage(
        `✅ تم إرسال طلب الطاولة رقم ${tableNumber} بنجاح.`
      );
    } catch (error: unknown) {
      console.error(
        "خطأ أثناء إرسال الطلب:",
        error
      );

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
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
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
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* العنوان */}

        <div className="mb-10 rounded-[32px] bg-yellow-500 p-8 text-black">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <h1 className="text-4xl font-black">
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

        {/* المنتجات */}

        <div className="space-y-6">
          {items.map((item) => (
            <CartItem
              key={item.id}
              image={item.image}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              onRemove={() =>
                removeFromCart(item.id)
              }
            />
          ))}
        </div>

        {/* ملخص السلة */}

        <div className="mt-10">
          <CartSummary
            total={total}
            onClear={clearCart}
          />
        </div>

        {/* تأكيد الطلب */}

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
            onCheckout={
              handleCheckout
            }
            disabled={loading}
          />

          {loading && (
            <div className="mt-8 text-center text-lg font-bold text-yellow-400">
              ⏳ جاري إرسال الطلب...
            </div>
          )}

          {message && (
            <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-green-400">
              <CheckCircle2
                size={26}
              />

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