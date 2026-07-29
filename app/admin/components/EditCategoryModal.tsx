"use client";

import { useEffect, useState } from "react";
import CategoryForm from "./CategoryForm";
import { updateCategory } from "./CategoryActions";

interface Category {
  id: number;
  name_ar: string;
  sort_order: number;
}

interface EditCategoryModalProps {
  open: boolean;
  category: any;
  onClose: () => void;
}

export default function EditCategoryModal({
  open,
  category,
  onClose,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name_ar ?? "");
      setSortOrder(category.sort_order ?? 0);
    }
  }, [category]);

  if (!open || !category) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await updateCategory(
        Number(category.id),
        name,
        sortOrder
      );

      alert("تم تحديث التصنيف بنجاح");

      onClose();
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 text-white border border-zinc-700">
        <h2 className="mb-4 text-xl font-bold text-yellow-400">
          تعديل التصنيف
        </h2>

        <form onSubmit={handleSubmit}>
          <CategoryForm
            name={name}
            setName={setName}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 hover:bg-gray-500"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {loading ? "جارٍ الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}