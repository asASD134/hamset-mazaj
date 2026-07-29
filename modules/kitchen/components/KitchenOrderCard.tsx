"use client";

import { updateOrderStatus } from "@/services/orders";
import { KitchenOrder } from "../types/kitchen";

type KitchenOrderCardProps = {
  order: KitchenOrder;
  refresh?: () => void;
};

function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "🟡 بانتظار التحضير";

    case "preparing":
      return "🔵 جاري التحضير";

    case "ready":
      return "🟢 جاهز للتسليم";

    case "completed":
      return "✅ تم التسليم";

    default:
      return status;
  }
}

export default function KitchenOrderCard({
  order,
  refresh,
}: KitchenOrderCardProps) {
  async function changeStatus(status: string) {
    if (status === order.status) return;

    await updateOrderStatus(order.id, status);

    refresh?.();
  }

  return (
    <div className="rounded-2xl border border-yellow-500 bg-zinc-900 p-6">

      <div className="flex items-center justify-between">

        <h2 className="text-3xl font-bold text-yellow-400">
          🍽️ الطاولة {order.tableNumber}
        </h2>

        <span className="rounded-full bg-yellow-400 px-4 py-2 font-bold text-black">
          {getStatusText(order.status)}
        </span>

      </div>

      <div className="mt-6 rounded-xl bg-black/30 p-4">

        <h3 className="mb-4 text-lg font-bold text-yellow-300">
          الأصناف
        </h3>

        {order.items.length === 0 ? (
          <p className="text-gray-400">
            لا توجد أصناف
          </p>
        ) : (
          <div className="space-y-3">

            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-zinc-700 pb-2"
              >
                <span className="text-lg font-semibold">
                  {item.name}
                </span>

                <span className="rounded-full bg-yellow-500 px-3 py-1 font-bold text-black">
                  × {item.quantity}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

      <div className="mt-5 text-xl font-bold text-yellow-400">
        الإجمالي: {order.totalPrice} ريال
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">

        <button
          disabled={order.status !== "pending"}
          onClick={() => changeStatus("preparing")}
          className="rounded-xl bg-blue-600 py-3 font-bold disabled:opacity-40"
        >
          بدء التحضير
        </button>

        <button
          disabled={order.status !== "preparing"}
          onClick={() => changeStatus("ready")}
          className="rounded-xl bg-green-600 py-3 font-bold disabled:opacity-40"
        >
          جاهز
        </button>

        <button
          disabled={order.status !== "ready"}
          onClick={() => changeStatus("completed")}
          className="rounded-xl bg-red-600 py-3 font-bold disabled:opacity-40"
        >
          تم التسليم
        </button>

      </div>

    </div>
  );
}