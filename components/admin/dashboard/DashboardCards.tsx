"use client";

import StatCard from "@/components/ui/StatCard";

interface Props {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  totalOrders: number;
  pendingOrders: number;
  serviceRequests: number;
  todaySales: number;
  totalProducts: number;
}

export default function DashboardCards({
  totalTables,
  availableTables,
  occupiedTables,
  totalOrders,
  pendingOrders,
  serviceRequests,
  todaySales,
  totalProducts,
}: Props) {
  const cards = [
    {
      title: "إجمالي الطاولات",
      value: totalTables,
      icon: "🍽️",
      color: "text-yellow-400",
    },
    {
      title: "الطاولات المتاحة",
      value: availableTables,
      icon: "🟢",
      color: "text-green-400",
    },
    {
      title: "الطاولات المشغولة",
      value: occupiedTables,
      icon: "🔴",
      color: "text-red-400",
    },
    {
      title: "إجمالي الطلبات",
      value: totalOrders,
      icon: "📦",
      color: "text-blue-400",
    },
    {
      title: "طلبات قيد الانتظار",
      value: pendingOrders,
      icon: "⏳",
      color: "text-orange-400",
    },
    {
      title: "طلبات الخدمة",
      value: serviceRequests,
      icon: "🔔",
      color: "text-purple-400",
    },
    {
      title: "إجمالي المبيعات",
      value: `${todaySales.toFixed(2)} ر.س`,
      icon: "💰",
      color: "text-emerald-400",
    },
    {
      title: "منتجات المنيو",
      value: totalProducts,
      icon: "☕",
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}