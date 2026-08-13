"use client";

import { MenuItem } from "@/types/menu";

interface MenuTableProps {
  items: MenuItem[];
  onToggle: (
    id: string,
    available: boolean
  ) => void;
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
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-16 text-center">
        <div className="mb-5 text-6xl">
          ☕
        </div>

        <h2 className="text-2xl font-black text-white">
          لا توجد منتجات
        </h2>

        <p className="mt-2 text-zinc-500">
          أضف أول منتج إلى المنيو ليظهر هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`group overflow-hidden rounded-3xl border bg-zinc-950 shadow-xl transition duration-200 hover:-translate-y-1 ${
            item.available
              ? "border-zinc-800 hover:border-yellow-500/40"
              : "border-red-500/20 opacity-80"
          }`}
        >
          {/* صورة المنتج */}
          <div className="relative h-56 overflow-hidden bg-zinc-900">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                <div className="text-center">
                  <div className="text-6xl">
                    ☕
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    لا صورة
                  </p>
                </div>
              </div>
            )}

            {/* طبقة الصورة */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* حالة المنتج */}
            <div className="absolute right-4 top-4">
              {item.available ? (
                <span className="rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1.5 text-xs font-bold text-green-400 backdrop-blur">
                  ● متوفر
                </span>
              ) : (
                <span className="rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-400 backdrop-blur">
                  ● غير متوفر
                </span>
              )}
            </div>

            {/* المنتج المميز */}
            {item.featured && (
              <div className="absolute left-4 top-4">
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/15 px-3 py-1.5 text-xs font-bold text-yellow-400 backdrop-blur">
                  ⭐ مميز
                </span>
              </div>
            )}

            {/* السعر */}
            <div className="absolute bottom-4 right-4">
              <div className="rounded-xl border border-yellow-500/20 bg-black/80 px-4 py-2 backdrop-blur">
                <span className="text-xl font-black text-yellow-400">
                  {Number(item.price).toFixed(2)}
                </span>

                <span className="mr-1 text-xs text-zinc-400">
                  ر.س
                </span>
              </div>
            </div>
          </div>

          {/* معلومات المنتج */}
          <div className="p-5">
            <div className="mb-3">
              <h2 className="truncate text-xl font-black text-white">
                {item.name}
              </h2>

              {item.category && (
                <div className="mt-2 inline-flex rounded-lg bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">
                  {item.category}
                </div>
              )}
            </div>

            <p className="min-h-[48px] text-sm leading-6 text-zinc-500">
              {item.description ||
                "لا يوجد وصف للمنتج."}
            </p>

            {/* الأزرار */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {/* إظهار / إخفاء */}
              <button
                type="button"
                onClick={() =>
                  onToggle(
                    item.id,
                    !item.available
                  )
                }
                className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                  item.available
                    ? "border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    : "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                }`}
              >
                {item.available
                  ? "إخفاء المنتج"
                  : "إظهار المنتج"}
              </button>

              {/* تعديل */}
              <button
                type="button"
                onClick={() =>
                  onEdit(item.id)
                }
                className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
              >
                تعديل
              </button>

              {/* حذف */}
              <button
                type="button"
                onClick={() => {
                  const confirmed =
                    window.confirm(
                      `هل أنت متأكد من حذف المنتج "${item.name}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`
                    );

                  if (!confirmed) {
                    return;
                  }

                  onDelete(item.id);
                }}
                className="col-span-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
              >
                حذف المنتج
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}