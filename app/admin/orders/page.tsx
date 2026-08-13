"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
} from "@/services/orders";
import { Order } from "@/types/order";

type FilterStatus = "all" | Order["status"];

function getStatusText(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "قيد الانتظار";

    case "accepted":
      return "مقبول";

    case "preparing":
      return "قيد التحضير";

    case "ready":
      return "جاهز";

    case "served":
      return "تم التسليم";

    case "completed":
      return "مكتمل";

    case "cancelled":
      return "ملغي";

    default:
      return status;
  }
}

function getStatusColor(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";

    case "accepted":
      return "text-blue-400 border-blue-500/30 bg-blue-500/10";

    case "preparing":
      return "text-orange-400 border-orange-500/30 bg-orange-500/10";

    case "ready":
      return "text-green-400 border-green-500/30 bg-green-500/10";

    case "served":
      return "text-purple-400 border-purple-500/30 bg-purple-500/10";

    case "completed":
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

    case "cancelled":
      return "text-red-400 border-red-500/30 bg-red-500/10";

    default:
      return "text-zinc-300 border-zinc-700 bg-zinc-800";
  }
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return date;
  }
}

const statusSteps: {
  status: Order["status"];
  label: string;
  icon: string;
}[] = [
  {
    status: "pending",
    label: "قيد الانتظار",
    icon: "⏳",
  },
  {
    status: "preparing",
    label: "قيد التحضير",
    icon: "👨‍🍳",
  },
  {
    status: "ready",
    label: "جاهز",
    icon: "✅",
  },
  {
    status: "served",
    label: "تم التسليم",
    icon: "🤝",
  },
  {
    status: "completed",
    label: "مكتمل",
    icon: "🏁",
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [filter, setFilter] =
    useState<FilterStatus>("all");

  async function loadOrders() {
    try {
      setLoading(true);

      const data = await getOrders();

      setOrders(data);
    } catch (error) {
      console.error(
        "خطأ في تحميل الطلبات:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل الطلبات."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function changeStatus(
    id: string,
    status: Order["status"]
  ) {
    try {
      setUpdatingId(id);

      await updateOrderStatus(id, status);

      const data = await getOrders();

      setOrders(data);
    } catch (error) {
      console.error(
        "خطأ في تغيير حالة الطلب:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تغيير حالة الطلب."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === filter
    );
  }, [orders, filter]);

  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "preparing"
  ).length;

  const readyCount = orders.filter(
    (order) => order.status === "ready"
  ).length;

  const servedCount = orders.filter(
    (order) => order.status === "served"
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "completed"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const totalSales = orders
    .filter(
      (order) => order.status !== "cancelled"
    )
    .reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black p-6 text-white md:p-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-yellow-500/20 bg-zinc-950">
            <div className="text-center">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

              <p className="font-bold text-yellow-400">
                جاري تحميل الطلبات...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black p-4 text-white md:p-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* ========================= */}
        {/* Header */}
        {/* ========================= */}

        <div className="mb-6 overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">

          <div className="p-6 md:p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 text-3xl">
                    🧾
                  </div>

                  <div>
                    <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
                      إدارة الطلبات
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500 md:text-base">
                      متابعة طلبات العملاء وإدارة حالتها
                    </p>
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-yellow-500/20 bg-black/60 px-6 py-4 text-center">
                  <p className="text-xs text-zinc-500">
                    إجمالي الطلبات
                  </p>

                  <p className="mt-1 text-3xl font-black text-yellow-400">
                    {orders.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-black/60 px-6 py-4 text-center">
                  <p className="text-xs text-zinc-500">
                    المبيعات
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-400">
                    {totalSales.toFixed(0)}
                  </p>

                  <p className="text-xs text-zinc-500">
                    ر.س
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ========================= */}
        {/* Statistics */}
        {/* ========================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-2xl border p-4 text-right transition ${
              filter === "all"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-zinc-800 bg-zinc-950 hover:border-yellow-500/30"
            }`}
          >
            <div className="text-2xl">
              📋
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              الكل
            </p>

            <p className="text-2xl font-black text-white">
              {orders.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-2xl border p-4 text-right transition ${
              filter === "pending"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-zinc-800 bg-zinc-950 hover:border-yellow-500/30"
            }`}
          >
            <div className="text-2xl">
              ⏳
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              انتظار
            </p>

            <p className="text-2xl font-black text-yellow-400">
              {pendingCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("preparing")}
            className={`rounded-2xl border p-4 text-right transition ${
              filter === "preparing"
                ? "border-orange-500 bg-orange-500/10"
                : "border-zinc-800 bg-zinc-950 hover:border-orange-500/30"
            }`}
          >
            <div className="text-2xl">
              👨‍🍳
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              تحضير
            </p>

            <p className="text-2xl font-black text-orange-400">
              {preparingCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("ready")}
            className={`rounded-2xl border p-4 text-right transition ${
              filter === "ready"
                ? "border-green-500 bg-green-500/10"
                : "border-zinc-800 bg-zinc-950 hover:border-green-500/30"
            }`}
          >
            <div className="text-2xl">
              ✅
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              جاهز
            </p>

            <p className="text-2xl font-black text-green-400">
              {readyCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("served")}
            className={`rounded-2xl border p-4 text-right transition ${
              filter === "served"
                ? "border-purple-500 bg-purple-500/10"
                : "border-zinc-800 bg-zinc-950 hover:border-purple-500/30"
            }`}
          >
            <div className="text-2xl">
              🤝
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              تسليم
            </p>

            <p className="text-2xl font-black text-purple-400">
              {servedCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`rounded-2xl border p-4 text-right transition ${
              filter === "completed"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-zinc-800 bg-zinc-950 hover:border-emerald-500/30"
            }`}
          >
            <div className="text-2xl">
              🏁
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              مكتمل
            </p>

            <p className="text-2xl font-black text-emerald-400">
              {completedCount}
            </p>
          </button>

        </div>

        {/* ========================= */}
        {/* Filter Bar */}
        {/* ========================= */}

        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">

          <div className="flex gap-2 overflow-x-auto pb-1">

            {[
              {
                value: "all" as FilterStatus,
                label: "كل الطلبات",
              },
              {
                value: "pending" as FilterStatus,
                label: "قيد الانتظار",
              },
              {
                value: "accepted" as FilterStatus,
                label: "مقبول",
              },
              {
                value: "preparing" as FilterStatus,
                label: "قيد التحضير",
              },
              {
                value: "ready" as FilterStatus,
                label: "جاهز",
              },
              {
                value: "served" as FilterStatus,
                label: "تم التسليم",
              },
              {
                value: "completed" as FilterStatus,
                label: "مكتمل",
              },
              {
                value: "cancelled" as FilterStatus,
                label: "ملغي",
              },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFilter(item.value)
                }
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${
                  filter === item.value
                    ? "bg-yellow-500 text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}

          </div>

        </div>

        {/* ========================= */}
        {/* Cancelled count */}
        {/* ========================= */}

        {cancelledCount > 0 && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            يوجد حاليًا {cancelledCount} طلب ملغي.
          </div>
        )}

        {/* ========================= */}
        {/* Orders */}
        {/* ========================= */}

        {filteredOrders.length === 0 ? (

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-16 text-center">

            <div className="mb-5 text-6xl">
              📭
            </div>

            <h2 className="text-2xl font-black">
              لا توجد طلبات
            </h2>

            <p className="mt-2 text-zinc-500">
              لا توجد طلبات في هذا التصنيف حاليًا.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {filteredOrders.map((order) => (

              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl transition hover:border-yellow-500/30"
              >

                {/* Order Header */}

                <div className="border-b border-zinc-800 bg-gradient-to-l from-zinc-900 to-black p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="text-xl">
                          🪑
                        </span>

                        <span className="text-sm text-zinc-500">
                          الطاولة
                        </span>

                      </div>

                      <p className="mt-1 text-4xl font-black text-white">
                        {order.table_number}
                      </p>

                    </div>

                    <div
                      className={`rounded-xl border px-4 py-2 text-sm font-bold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(
                        order.status
                      )}
                    </div>

                  </div>

                  <div className="mt-5 flex items-center justify-between">

                    <div>
                      <p className="text-xs text-zinc-600">
                        رقم الطلب
                      </p>

                      <p className="font-mono text-sm text-zinc-400">
                        #{order.id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="text-left">

                      <p className="text-xs text-zinc-600">
                        وقت الطلب
                      </p>

                      <p className="text-sm text-zinc-400">
                        {formatDate(
                          order.created_at
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* Items */}

                <div className="p-5">

                  <div className="mb-4 flex items-center justify-between">

                    <h3 className="font-bold text-white">
                      تفاصيل الطلب
                    </h3>

                    <span className="rounded-lg bg-zinc-900 px-3 py-1 text-xs text-zinc-500">
                      {order.items.length} أصناف
                    </span>

                  </div>

                  <div className="space-y-2">

                    {order.items.map((item) => (

                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black p-3"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-yellow-500/10 px-2 font-black text-yellow-400">
                            ×{item.quantity}
                          </div>

                          <div>

                            <p className="font-bold text-white">
                              {item.name}
                            </p>

                            <p className="text-xs text-zinc-600">
                              {item.price} ر.س للوحدة
                            </p>

                          </div>

                        </div>

                        <p className="font-bold text-yellow-400">
                          {(
                            Number(item.price) *
                            Number(item.quantity)
                          ).toFixed(2)}{" "}
                          ر.س
                        </p>

                      </div>

                    ))}

                  </div>

                  {/* Total */}

                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                    <span className="text-zinc-400">
                      إجمالي الطلب
                    </span>

                    <span className="text-3xl font-black text-yellow-400">
                      {Number(order.total).toFixed(2)}{" "}
                      <span className="text-base">
                        ر.س
                      </span>
                    </span>

                  </div>

                  {/* ========================= */}
                  {/* Order Progress */}
                  {/* ========================= */}

                  <div className="mt-6">

                    <p className="mb-4 text-sm font-bold text-zinc-400">
                      مراحل الطلب
                    </p>

                    <div className="grid grid-cols-5 gap-1">

                      {statusSteps.map(
                        (step, index) => {

                          const active =
                            order.status ===
                            step.status;

                          const disabled =
                            updatingId ===
                            order.id;

                          return (
                            <button
                              key={step.status}
                              type="button"
                              disabled={disabled}
                              onClick={() =>
                                changeStatus(
                                  order.id,
                                  step.status
                                )
                              }
                              className={`group relative rounded-xl border p-2 text-center transition ${
                                active
                                  ? "border-yellow-500 bg-yellow-500/10"
                                  : "border-zinc-800 bg-black hover:border-zinc-600"
                              } ${
                                disabled
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >

                              <div
                                className={`text-lg ${
                                  active
                                    ? ""
                                    : "grayscale opacity-60"
                                }`}
                              >
                                {step.icon}
                              </div>

                              <p
                                className={`mt-1 text-[10px] font-bold leading-tight ${
                                  active
                                    ? "text-yellow-400"
                                    : "text-zinc-600 group-hover:text-zinc-300"
                                }`}
                              >
                                {step.label}
                              </p>

                              {index <
                                statusSteps.length -
                                  1 && (
                                <span className="pointer-events-none absolute -left-1 top-1/2 hidden -translate-y-1/2 text-zinc-700 xl:block">
                                  ‹
                                </span>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* Other statuses */}

                  <div className="mt-4 flex gap-2">

                    <button
                      type="button"
                      disabled={
                        updatingId === order.id
                      }
                      onClick={() =>
                        changeStatus(
                          order.id,
                          "accepted"
                        )
                      }
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm font-bold transition ${
                        order.status ===
                        "accepted"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-zinc-800 bg-black text-zinc-500 hover:border-blue-500/30 hover:text-blue-400"
                      }`}
                    >
                      👍 مقبول
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingId === order.id
                      }
                      onClick={() =>
                        changeStatus(
                          order.id,
                          "cancelled"
                        )
                      }
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm font-bold transition ${
                        order.status ===
                        "cancelled"
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : "border-zinc-800 bg-black text-zinc-500 hover:border-red-500/30 hover:text-red-400"
                      }`}
                    >
                      ✕ إلغاء
                    </button>

                  </div>

                  {updatingId === order.id && (
                    <div className="mt-4 rounded-xl bg-yellow-500/10 p-3 text-center text-sm font-bold text-yellow-400">
                      جاري تحديث حالة الطلب...
                    </div>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </main>
  );
}