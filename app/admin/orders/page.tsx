"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "@/services/orders";
import { Order } from "@/types/order";

export default function AdminOrdersPage() {
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
      <div className="flex items-center justify-center py-20 text-xl">
        جاري تحميل الطلبات...
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-yellow-400">
          الطلبات
        </h1>

        <p className="text-gray-400">
          الطلبات الواردة من العملاء
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-10 text-center">
          لا توجد طلبات
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                الطاولة {order.table_number}
              </h2>

              <span className="rounded bg-yellow-500 px-3 py-1 font-bold text-black">
                {order.status}
              </span>
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

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xl font-bold text-yellow-400">
                {order.total} ر.س
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
          </div>
        ))
      )}
    </main>
  );
}