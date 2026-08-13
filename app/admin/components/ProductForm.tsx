"use client";

import ProductImage from "./ProductImage";
import {
  Category,
  ProductFormData,
} from "./types";

interface Props {
  categories: Category[];
  form: ProductFormData;
  setForm: React.Dispatch<
    React.SetStateAction<ProductFormData>
  >;
}

export default function ProductForm({
  categories,
  form,
  setForm,
}: Props) {
  return (
    <div className="grid gap-5">
      <select
        required
        value={form.categoryId}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            categoryId: e.target.value,
          }))
        }
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3 text-white"
      >
        <option value="">
          اختر التصنيف
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

      <input
        required
        value={form.nameAr}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            nameAr: e.target.value,
          }))
        }
        placeholder="اسم المنتج"
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3"
      />

      <input
        value={form.nameEn}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            nameEn: e.target.value,
          }))
        }
        placeholder="اسم المنتج بالإنجليزية"
        dir="ltr"
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3"
      />

      <input
        type="number"
        required
        min="0"
        step="0.01"
        value={form.price}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            price: e.target.value,
          }))
        }
        placeholder="السعر"
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3"
      />

      <input
        type="number"
        min="0"
        value={form.calories}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            calories: e.target.value,
          }))
        }
        placeholder="السعرات الحرارية"
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3"
      />

      <textarea
        rows={4}
        value={form.descriptionAr}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            descriptionAr: e.target.value,
          }))
        }
        placeholder="الوصف"
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3"
      />

      <textarea
        rows={4}
        value={form.descriptionEn}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            descriptionEn: e.target.value,
          }))
        }
        placeholder="الوصف بالإنجليزية"
        dir="ltr"
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3"
      />

      <ProductImage
        image={form.image}
        onChange={(file) =>
          setForm((prev) => ({
            ...prev,
            image: file,
          }))
        }
      />
    </div>
  );
}