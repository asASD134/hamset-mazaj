"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  orders: number;
  pendingOrders: number;
  serviceRequests: number;
  sales: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    orders: 0,
    pendingOrders: 0,
    serviceRequests: 0,
    sales: 0,
  });

  async function loadStats() {
    const [
      ordersResult,
      servicesResult,
    ] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("service_requests").select("*"),
    ]);

    const orders = ordersResult.data ?? [];
    const services = servicesResult.data ?? [];

    setStats({
      orders: orders.length,
      pendingOrders: orders.filter(
        (o) => o.status === "pending"
      ).length,
      serviceRequests: services.filter(
        (s) => s.status === "pending"
      ).length,
      sales: orders.reduce(
        (sum, order) => sum + (order.total_price ?? 0),
        0
      ),
    });
  }

  useEffect(() => {
    loadStats();

    const ordersChannel = supabase
      .channel("dashboard-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        loadStats
      )
      .subscribe();

    const servicesChannel = supabase
      .channel("dashboard-services")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
        },
        loadStats
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, []);

  const cards = [
    {
      title: "إجمالي الطلبات",
      value: stats.orders,
      color: "bg-blue-600",
    },
    {
      title: "طلبات قيد الانتظار",
      value: stats.pendingOrders,
      color: "bg-yellow-500 text-black",
    },
    {
      title: "طلبات الخدمة",
      value: stats.serviceRequests,
      color: "bg-purple-600",
    },
    {
      title: "إجمالي المبيعات",
      value: `${stats.sales} ر.س`,
      color: "bg-green-600",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-10">
          لوحة التحكم
        </h1>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`${card.color} rounded-2xl p-6`}
            >
              <h2 className="text-lg font-bold">
                {card.title}
              </h2>

              <div className="text-4xl mt-4 font-bold">
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}