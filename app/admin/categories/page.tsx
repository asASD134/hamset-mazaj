"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import {
  ArrowDown,
  ArrowUp,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    add,
    update,
    remove,
  } = useCategories();

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black px-4 py-8 text-white md:px-8"
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 px-8 py-7 text-center shadow-xl">
            <Loader2
              size={40}
              className="mx-auto mb-4 animate-spin text-yellow-400"
            />

            <p className="font-bold text-zinc-200">
              جاري تحميل التصنيفات...
            </p>
          </div>
        </div>
      </main>
    );
  }

  async function handleAdd() {
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    try {
      setAdding(true);

      await add(
        cleanName,
        categories.length
      );

      setName("");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إضافة التصنيف"
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdate(
    id: string,
    value: string,
    sortOrder: number
  ) {
    const cleanName = value.trim();

    if (!cleanName) {
      alert("اسم التصنيف لا يمكن أن يكون فارغًا.");
      return;
    }

    try {
      await update(
        id,
        cleanName,
        sortOrder
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث التصنيف"
      );
    }
  }

  async function handleDelete(id: string) {
    const category = categories.find(
      (item) => item.id === id
    );

    const categoryName =
      category?.name_ar ?? "هذا التصنيف";

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف التصنيف "${categoryName}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await remove(id);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف التصنيف"
      );
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-8 text-white md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* رأس الصفحة */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/20">
              <Tag size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
                إدارة التصنيفات
              </h1>

              <p className="mt-1 text-zinc-400">
                تنظيم تصنيفات المنيو وإضافة وتعديل
                وحذف التصنيفات.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-950 px-5 py-3 text-center">
            <div className="text-2xl font-black text-yellow-400">
              {categories.length}
            </div>

            <div className="text-xs text-zinc-500">
              تصنيف
            </div>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-red-300">
            <div className="font-bold">
              حدث خطأ
            </div>

            <div className="mt-1 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* إضافة تصنيف */}
        <div className="mb-8 rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5 shadow-2xl md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
              <FolderPlus size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                إضافة تصنيف جديد
              </h2>

              <p className="text-sm text-zinc-500">
                أضف تصنيفًا جديدًا إلى المنيو
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !adding
                ) {
                  handleAdd();
                }
              }}
              placeholder="مثال: القهوة الساخنة"
              className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10"
            />

            <button
              type="button"
              onClick={handleAdd}
              disabled={
                adding || !name.trim()
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-7 py-3.5 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  إضافة التصنيف
                </>
              )}
            </button>
          </div>
        </div>

        {/* قائمة التصنيفات */}
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 shadow-2xl">
          <div className="border-b border-zinc-800 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  التصنيفات الحالية
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  يمكنك تعديل الاسم والترتيب مباشرة.
                </p>
              </div>

              <div className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300">
                {categories.length} تصنيف
              </div>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-500/10 text-yellow-400">
                <Tag size={38} />
              </div>

              <h3 className="text-xl font-bold">
                لا توجد تصنيفات حاليًا
              </h3>

              <p className="mt-2 text-zinc-500">
                أضف أول تصنيف باستخدام النموذج
                أعلاه.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {categories.map(
                (category, index) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    index={index}
                    total={categories.length}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface CategoryRowProps {
  category: {
    id: string;
    name_ar: string;
    sort_order: number;
  };

  index: number;
  total: number;

  onUpdate: (
    id: string,
    name: string,
    sortOrder: number
  ) => Promise<void>;

  onDelete: (
    id: string
  ) => Promise<void>;
}

function CategoryRow({
  category,
  index,
  total,
  onUpdate,
  onDelete,
}: CategoryRowProps) {
  const [value, setValue] =
    useState(category.name_ar);

  const [sortOrder, setSortOrder] =
    useState(category.sort_order);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  async function handleSave() {
    if (!value.trim()) {
      alert(
        "اسم التصنيف لا يمكن أن يكون فارغًا."
      );
      return;
    }

    try {
      setSaving(true);

      await onUpdate(
        category.id,
        value,
        sortOrder
      );

      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(category.name_ar);
    setSortOrder(
      category.sort_order
    );
    setEditing(false);
  }

  return (
    <div className="p-4 transition hover:bg-zinc-900/50 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* رقم التصنيف */}
        <div className="flex items-center gap-4 lg:w-[300px]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 font-black text-yellow-400">
            {index + 1}
          </div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                value={value}
                onChange={(e) =>
                  setValue(
                    e.target.value
                  )
                }
                autoFocus
                className="w-full rounded-xl border border-yellow-500 bg-black px-4 py-3 text-white outline-none"
              />
            ) : (
              <>
                <h3 className="truncate text-lg font-black text-white">
                  {category.name_ar}
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  تصنيف رقم {index + 1}
                </p>
              </>
            )}
          </div>
        </div>

        {/* الترتيب */}
        <div className="flex items-center gap-3 lg:w-[220px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400">
            {sortOrder <=
            0 ? (
              <ArrowDown size={18} />
            ) : (
              <ArrowUp size={18} />
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              ترتيب الظهور
            </label>

            <input
              type="number"
              min="0"
              value={sortOrder}
              disabled={!editing}
              onChange={(e) =>
                setSortOrder(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-28 rounded-xl border border-zinc-700 bg-black px-3 py-2 text-center text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* التحكم */}
        <div className="flex flex-1 flex-wrap gap-2 lg:justify-end">
          {!editing ? (
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
            >
              <Pencil size={17} />
              تعديل
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    حفظ...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    حفظ
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
              >
                <X size={17} />
                إلغاء
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() =>
              onDelete(
                category.id
              )
            }
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 size={17} />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}