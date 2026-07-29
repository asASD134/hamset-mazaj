"use client";

import { useState } from "react";
import CategoryForm from "./CategoryForm";
import {
  createCategory,
} from "./CategoryActions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({
  open,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(1);

  async function saveCategory() {
    try {
      setLoading(true);

      await createCategory(name, sortOrder);

      alert("تمت إضافة التصنيف بنجاح");

      setName("");
      setSortOrder(1);

      onClose();

      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-xl rounded-2xl border border-yellow-500/20 bg-zinc-900 p-8">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-yellow-400">
            إضافة تصنيف
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <CategoryForm
          name={name}
          setName={setName}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-700 px-6 py-3"
          >
            إلغاء
          </button>

          <button
            onClick={saveCategory}
            disabled={loading}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ التصنيف"}
          </button>
        </div>

      </div>
    </div>
  );
}