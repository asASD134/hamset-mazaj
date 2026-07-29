"use client";

import { useEffect, useState } from "react";
import { useTable } from "@/context/TableContext";

import SectionTitle from "@/components/ui/SectionTitle";
import MenuCard from "@/modules/menu/components/MenuCard";

import {
  getMenuCategories,
  type MenuCategory,
} from "@/modules/menu";

export default function MenuPage() {
  const { hasTable, tableNumber } = useTable();

  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);

  useEffect(() => {
    async function loadMenu() {
      const data = await getMenuCategories();
      setMenuCategories(data);
    }

    loadMenu();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black py-16 text-white">

      <div className="mx-auto max-w-7xl px-6">

        {hasTable && (
          <div className="mb-10 rounded-3xl border border-yellow-500 bg-yellow-500/10 p-6 text-center">

            <h2 className="text-3xl font-bold text-yellow-400">
              🍽️ الطلب للطاولة رقم {tableNumber}
            </h2>

            <p className="mt-2 text-gray-300">
              اختر الأصناف التي ترغب بها ثم أضفها إلى السلة.
            </p>

          </div>
        )}

        <SectionTitle
          title="☕ قائمة همسة مزاج"
          subtitle="القهوة • الشيشة • العصائر • الحلويات • المشروبات الساخنة والباردة"
        />

        {menuCategories.map((category) => (
          <section
            key={category.id}
            className="mb-16"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="h-10 w-1 rounded-full bg-yellow-500" />

              <h2 className="text-3xl font-bold text-yellow-400">
                {category.title}
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>

          </section>
        ))}

      </div>

    </main>
  );
}