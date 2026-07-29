"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import AddCategoryModal from "../components/AddCategoryModal";
import EditCategoryModal from "../components/EditCategoryModal";
import DeleteCategoryDialog from "../components/DeleteCategoryDialog";

interface Category {
  id: number;
  name_ar: string;
  sort_order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("categories-admin")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        loadData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    const { data: menuData } = await supabase
      .from("menu")
      .select("category_id");

    setCategories((categoriesData as Category[]) ?? []);

    const counts: Record<number, number> = {};

    (menuData ?? []).forEach((item: any) => {
      counts[item.category_id] =
        (counts[item.category_id] ?? 0) + 1;
    });

    setProductCounts(counts);
  }

  function handleEdit(category: Category) {
    setSelectedCategory(category);
    setOpenEditModal(true);
  }

  function handleDelete(category: Category) {
    if ((productCounts[category.id] ?? 0) > 0) {
      alert("لا يمكن حذف تصنيف يحتوي على منتجات.");
      return;
    }

    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name_ar
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [categories, search]);

  return (
    <>
      <AddCategoryModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          loadData();
        }}
      />

      <EditCategoryModal
        open={openEditModal}
        category={selectedCategory}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedCategory(null);
          loadData();
        }}
      />

      <DeleteCategoryDialog
        open={openDeleteDialog}
        category={selectedCategory}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedCategory(null);
          loadData();
        }}
      />

      <main className="min-h-screen bg-black text-white p-10">

        <div className="flex flex-wrap justify-between gap-4 mb-8">

          <h1 className="text-4xl font-bold text-yellow-400">
            إدارة التصنيفات
          </h1>

          <button
            onClick={() => setOpenAddModal(true)}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400"
          >
            + إضافة تصنيف
          </button>

        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن تصنيف..."
            className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-yellow-500/20">

          <table className="w-full">

            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 text-right">الاسم</th>
                <th className="p-4 text-center">الترتيب</th>
                <th className="p-4 text-center">عدد المنتجات</th>
                <th className="p-4 text-center">العمليات</th>
              </tr>
            </thead>

            <tbody>

              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t border-zinc-800"
                >
                  <td className="p-4">{category.name_ar}</td>

                  <td className="text-center">
                    {category.sort_order}
                  </td>

                  <td className="text-center">
                    {productCounts[category.id] ?? 0}
                  </td>

                  <td className="text-center">

                    <button
                      onClick={() => handleEdit(category)}
                      className="mx-2 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => handleDelete(category)}
                      className="mx-2 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
                    >
                      حذف
                    </button>

                  </td>
                </tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-400"
                  >
                    لا توجد تصنيفات
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </main>
    </>
  );
}