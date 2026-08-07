"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";

export default function CategoriesPage() {
  const {
    categories,
    loading,
    add,
    update,
    remove,
  } = useCategories();

  const [name, setName] = useState("");

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-xl">
        جاري تحميل التصنيفات...
      </div>
    );
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-yellow-400">
          إدارة التصنيفات
        </h1>

        <p className="mt-2 text-zinc-400">
          إضافة وتعديل وحذف تصنيفات المنيو.
        </p>
      </div>

      <div className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-6">
        <div className="flex gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم التصنيف"
            className="flex-1 rounded-lg border border-zinc-700 bg-black p-3"
          />

          <button
            onClick={async () => {
              if (!name.trim()) return;

              await add(name.trim());

              setName("");
            }}
            className="rounded-lg bg-yellow-500 px-6 font-bold text-black transition hover:bg-yellow-400"
          >
            إضافة
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-yellow-500/20">
        <table className="w-full">
          <thead className="bg-[#181818]">
            <tr>
              <th className="p-4 text-right">
                التصنيف
              </th>

              <th className="p-4">
                التحكم
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                id={category.id}
                name={category.name}
                onUpdate={update}
                onDelete={remove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

interface CategoryRowProps {
  id: string;
  name: string;
  onUpdate: (
    id: string,
    name: string
  ) => Promise<void>;
  onDelete: (
    id: string
  ) => Promise<void>;
}

function CategoryRow({
  id,
  name,
  onUpdate,
  onDelete,
}: CategoryRowProps) {
  const [value, setValue] = useState(name);

  return (
    <tr className="border-t border-zinc-800">
      <td className="p-4">
        <input
          value={value}
          onChange={(e) =>
            setValue(e.target.value)
          }
          className="w-full rounded bg-black p-2"
        />
      </td>

      <td className="space-x-2 space-x-reverse text-center">
        <button
          onClick={() =>
            onUpdate(id, value)
          }
          className="rounded bg-blue-600 px-4 py-2"
        >
          حفظ
        </button>

        <button
          onClick={() =>
            onDelete(id)
          }
          className="rounded bg-red-600 px-4 py-2"
        >
          حذف
        </button>
      </td>
    </tr>
  );
}