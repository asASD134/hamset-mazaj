"use client";

import { MenuItem } from "@/types/menu";

interface MenuTableProps {
  items: MenuItem[];
  onToggle: (id: string, available: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MenuTable({
  items,
  onToggle,
  onEdit,
  onDelete,
}: MenuTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-12 text-center">
        لا توجد منتجات.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-yellow-500/20">
      <table className="w-full">
        <thead className="bg-[#181818]">
          <tr>
            <th className="p-4 text-right">المنتج</th>
            <th className="p-4">السعر</th>
            <th className="p-4">الحالة</th>
            <th className="p-4">التحكم</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-t border-zinc-800"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-800 text-xs">
                      لا صورة
                    </div>
                  )}

                  <div>
                    <div className="font-bold">
                      {item.name}
                    </div>

                    <div className="text-sm text-zinc-400">
                      {item.description}
                    </div>
                  </div>
                </div>
              </td>

              <td className="text-center">
                {item.price} ر.س
              </td>

              <td className="text-center">
                {item.available ? (
                  <span className="font-bold text-green-400">
                    متوفر
                  </span>
                ) : (
                  <span className="font-bold text-red-400">
                    غير متوفر
                  </span>
                )}
              </td>

              <td className="space-x-2 space-x-reverse text-center">
                <button
                  onClick={() =>
                    onToggle(
                      item.id,
                      !item.available
                    )
                  }
                  className="rounded bg-yellow-500 px-3 py-2 text-black"
                >
                  {item.available
                    ? "إخفاء"
                    : "إظهار"}
                </button>

                <button
                  onClick={() => onEdit(item.id)}
                  className="rounded bg-blue-600 px-3 py-2"
                >
                  تعديل
                </button>

                <button
                  onClick={() =>
                    onDelete(item.id)
                  }
                  className="rounded bg-red-600 px-3 py-2"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}