"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import AddMenuItemModal from "../components/AddMenuItemModal";
import { deleteProduct } from "../components/ProductActions";
import { MenuItem, Category } from "../components/types";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("admin-menu")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menu",
        },
        loadData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    const { data: menuData } = await supabase
      .from("menu")
      .select("*")
      .order("sort_order");

    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    setItems((menuData as MenuItem[]) ?? []);
    setCategories((categoryData as Category[]) ?? []);
  }

  async function handleDelete(id: number) {
    if (!confirm("هل تريد حذف المنتج؟")) return;

    await deleteProduct(id);

    loadData();
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name_ar
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all"
          ? true
          : item.category_id === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [items, search, categoryFilter]);

  return (
    <>
      <AddMenuItemModal
        open={openModal}
        editingItem={editingItem}
        onClose={() => {
          setEditingItem(null);
          setOpenModal(false);
          loadData();
        }}
      />

      <main className="min-h-screen bg-black text-white p-10">

        <div className="flex flex-wrap gap-4 justify-between mb-8">

          <h1 className="text-4xl font-bold text-yellow-400">
            إدارة المنيو
          </h1>

          <button
            onClick={() => {
              setEditingItem(null);
              setOpenModal(true);
            }}
            className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
          >
            + إضافة منتج
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">

          <input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 rounded-xl p-4"
          />

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value === "all"
                  ? "all"
                  : Number(e.target.value)
              )
            }
            className="bg-zinc-900 rounded-xl p-4"
          >
            <option value="all">
              جميع التصنيفات
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name_ar}
              </option>
            ))}
          </select>

        </div>

        <div className="overflow-hidden rounded-2xl border border-yellow-500/20">

          <table className="w-full">

            <thead className="bg-zinc-900">

              <tr>
                <th className="p-4">الصورة</th>
                <th className="p-4">الاسم</th>
                <th className="p-4">السعر</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">العمليات</th>
              </tr>

            </thead>

            <tbody>

              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-zinc-800"
                >
                  <td className="p-4">
                    <img
                      src={item.image_url}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </td>

                  <td>{item.name_ar}</td>

                  <td>{item.price} ريال</td>

                  <td>
                    {categories.find(
                      (c) => c.id === item.category_id
                    )?.name_ar}
                  </td>

                  <td>

                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setOpenModal(true);
                      }}
                      className="text-blue-400 mx-2"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="text-red-400 mx-2"
                    >
                      حذف
                    </button>

                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </main>
    </>
  );
}