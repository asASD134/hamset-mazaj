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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      const data = await getMenuCategories();
      setMenuCategories(data);
      setLoading(false);
    }

    loadMenu();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">

      <section className="relative overflow-hidden border-b border-yellow-500/20 bg-gradient-to-b from-[#181818] via-[#111111] to-black py-24">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">

          {hasTable && (
            <div className="mx-auto mb-10 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-8 py-4">

              <span className="text-lg font-bold text-yellow-400">
                🍽️ الطلب للطاولة رقم {tableNumber}
              </span>

            </div>
          )}

          <h1 className="text-5xl font-black text-white md:text-6xl">
            قائمة همسة مزاج
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-zinc-400">
            استمتع بأفضل القهوة المختصة، الحلويات،
            المشروبات الساخنة والباردة،
            الشيشة، والعصائر الطازجة.
          </p>

        </div>

      </section>

      <section className="py-20">

        <div className="mx-auto max-w-7xl px-6">

          <SectionTitle
            title="المنيو"
            subtitle="اختر ما يناسب ذوقك ثم أضفه إلى السلة."
          />

          {loading ? (
            <div className="py-32 text-center">

              <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

              <p className="text-zinc-400">
                جاري تحميل قائمة الطعام...
              </p>

            </div>
          ) : (
            menuCategories.map((category) => (
              <section
                key={category.id}
                className="mb-24"
              >
                <div className="mb-10 flex items-center gap-5">

                  <div className="h-12 w-2 rounded-full bg-yellow-500" />

                  <div>

                    <h2 className="text-4xl font-black text-yellow-400">
                      {category.title}
                    </h2>

                    <div className="mt-2 h-[2px] w-24 rounded-full bg-yellow-500/40" />

                  </div>

                </div>

                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">

                  {category.items.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                    />
                  ))}

                </div>

              </section>
            ))
          )}

        </div>

      </section>

    </main>
  );
}