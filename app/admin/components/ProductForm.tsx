"use client";

import ProductImage from "./ProductImage";
import { Category, ProductFormData } from "./types";

interface Props {
  categories: Category[];
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export default function ProductForm({
  categories,
  form,
  setForm,
}: Props) {
  return (
    <div className="grid gap-5">
      <select
        value={form.categoryId}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            categoryId: e.target.value,
          }))
        }
        className="rounded-xl border border-yellow-500/20 bg-zinc-900 p-3"
      >
        <option value="">اختر التصنيف</option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <input
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
        type="number"
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