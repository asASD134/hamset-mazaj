"use client";

import { useEffect, useState } from "react";

import {
  getKitchenOrders,
} from "@/modules/kitchen";

import { KitchenOrder } from "@/modules/kitchen";

import { KitchenOrderCard } from "@/modules/kitchen/components";

import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const data = await getKitchenOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useRealtimeOrders(loadOrders);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        جاري تحميل الطلبات...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-yellow-400 text-center mb-10">
          👨‍🍳 شاشة المطبخ
        </h1>

        {orders.length === 0 ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-yellow-400">
              لا توجد طلبات حالياً
            </h2>

            <p className="text-gray-300 mt-3">
              ستظهر الطلبات الجديدة هنا.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                refresh={loadOrders}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}