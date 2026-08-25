"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";
import ProductForm from "./ProductForm";
import {
  createProduct,
  updateProduct,
} from "./ProductActions";
import {
  Category,
  ProductFormData,
  MenuItem,
} from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  editingItem?: MenuItem | null;
}

const emptyForm: ProductFormData = {
  categoryId: "",
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  price: "",
  calories: "",
  image: null,
};

export default function AddMenuItemModal({
  open,
  onClose,
  editingItem,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] =
    useState<ProductFormData>(emptyForm);

  useEffect(() => {
    if (!open) return;

    loadCategories();

    if (editingItem) {
      setForm({
        categoryId: editingItem.category_id.toString(),
        nameAr: editingItem.name_ar,
        nameEn: editingItem.name_en,
        descriptionAr: editingItem.description_ar,
        descriptionEn: editingItem.description_en,
        price: editingItem.price.toString(),
        calories: editingItem.calories.toString(),
        image: null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editingItem]);

  async function loadCategories() {
    const cafeId = await getClientCafeId();
    const { data } = await supabase.from("categories").select("*").eq("cafe_id", cafeId).order("sort_order");

    setCategories((data as Category[]) ?? []);
  }

  async function saveProduct() {
    try {
      setLoading(true);

      if (editingItem) {
        await updateProduct(
          editingItem.id,
          form,
          editingItem.image_url
        );

        alert("تم تعديل المنتج بنجاح");
      } else {
        await createProduct(form);

        alert("تمت إضافة المنتج بنجاح");
      }

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
      <div className="w-full max-w-3xl rounded-2xl border border-yellow-500/20 bg-zinc-900 p-8">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-yellow-400">
            {editingItem ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <ProductForm
          categories={categories}
          form={form}
          setForm={setForm}
        />

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-700 px-6 py-3"
          >
            إلغاء
          </button>

          <button
            onClick={saveProduct}
            disabled={loading}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black disabled:opacity-50"
          >
            {loading
              ? "جاري الحفظ..."
              : editingItem
              ? "حفظ التعديلات"
              : "حفظ المنتج"}
          </button>
        </div>

      </div>
    </div>
  );
}