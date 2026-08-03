"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Receipt,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  order_number: string;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  tables: { table_number: number } | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const firstLoad = useRef(true);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, tables(table_number)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  }

  async function completeOrder(id: number) {
    await supabase
      .from("orders")
      .update({
        status: "completed",
      })
      .eq("id", id);

    loadOrders();
  }

  useEffect(() => {
    loadOrders();

    const audio = new Audio("/sounds/new-order.mp3");

    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders();

          if (!firstLoad.current) {
            audio.play().catch(() => {});
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    firstLoad.current = false;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400">
              شاشة الطلبات المباشرة
            </h1>

            <p className="mt-2 text-gray-400">
              جميع طلبات العملاء تظهر هنا مباشرة.
            </p>
          </div>

          <div className="rounded-2xl bg-yellow-500 px-6 py-4 text-black">
            <div className="text-sm font-bold">
              إجمالي الطلبات
            </div>

            <div className="text-3xl font-bold">
              {orders.length}
            </div>
          </div>
        </div>

        {orders.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-16 text-center">
            <Bell
              size={70}
              className="mx-auto text-yellow-400"
            />

            <h2 className="mt-6 text-3xl font-bold">
              لا توجد طلبات حالياً
            </h2>

            <p className="mt-3 text-gray-400">
              سيتم عرض الطلبات الجديدة فور وصولها.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    🪑 الطاولة {order.tables?.table_number}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-gray-400">
                    <Receipt size={18} />
                    #{order.order_number}
                  </div>
                </div>

                <span
                  className={`rounded-full px-4 py-2 font-bold ${
                    order.status === "completed"
                      ? "bg-green-600"
                      : "bg-orange-600"
                  }`}
                >
                  {order.status === "completed"
                    ? "تم التنفيذ"
                    : "قيد التنفيذ"}
                </span>
              </div>

              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    الإجمالي
                  </span>

                  <span className="font-bold text-yellow-400">
                    {order.total_price} ر.س
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Clock3 size={18} />

                  {new Date(
                    order.created_at
                  ).toLocaleString("ar-SA")}
                </div>

                {order.notes && (
                  <div className="rounded-2xl bg-zinc-800 p-4 text-gray-300">
                    {order.notes}
                  </div>
                )}
              </div>

              {order.status !== "completed" && (
                <button
                  onClick={() => completeOrder(order.id)}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-4 text-lg font-bold transition hover:bg-green-500"
                >
                  <CheckCircle2 size={22} />
                  تم التنفيذ
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}