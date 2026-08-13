"use client";

import { deleteCategory } from "./CategoryActions";

interface Category {
  id: string;
  name_ar: string;
}

interface DeleteCategoryDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

export default function DeleteCategoryDialog({
  open,
  category,
  onClose,
}: DeleteCategoryDialogProps) {
  if (!open || !category) {
    return null;
  }

  async function handleDelete() {
    try {
      await deleteCategory(
        category.id
      );

      alert("تم حذف التصنيف بنجاح");

      onClose();
      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف التصنيف"
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-white">
        <h2 className="mb-4 text-xl font-bold text-red-500">
          حذف التصنيف
        </h2>

        <p className="mb-6 text-gray-300">
          هل أنت متأكد من حذف التصنيف
          <span className="font-bold text-yellow-400">
            {" "}
            {category.name_ar}
          </span>
          ؟
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-600 px-4 py-2 hover:bg-gray-500"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}