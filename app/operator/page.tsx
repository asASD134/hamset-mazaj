"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOrders, updateOrderStatus } from "@/services/orders";
import { Order } from "@/types/order";

export default function OperatorPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadOrders();
    }

    init();

    const channel = supabase
      .channel("operator-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async () => {
          const audio = new Audio("/sounds/notification.mp3");
          audio.play().catch(() => {});

          await loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function changeStatus(
    id: string,
    status: Order["status"]
  ) {
    await updateOrderStatus(id, status);
    await loadOrders();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-2xl text-white">
        جاري تحميل الطلبات...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-yellow-400">
          شاشة استقبال الطلبات
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-zinc-900 p-10 text-center text-xl">
            لا توجد طلبات حالياً
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      الطاولة {order.table_number}
                    </h2>

                    <p className="text-zinc-400">
                      {new Date(order.created_at).toLocaleString("ar-SA")}
                    </p>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      changeStatus(
                        order.id,
                        e.target.value as Order["status"]
                      )
                    }
                    className="rounded-lg border border-yellow-500 bg-black px-4 py-2"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="preparing">قيد التحضير</option>
                    <option value="ready">جاهز</option>
                    <option value="served">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>

                <div className="mt-6 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between border-b border-zinc-700 pb-2"
                    >
                      <span>
                        {item.quantity} × {item.name}
                      </span>

                      <span>{item.price} ر.س</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-left text-2xl font-bold text-yellow-400">
                  الإجمالي: {order.total} ر.س
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}