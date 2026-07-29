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
    <div className="grid grid-cols-2 gap-5">
      <select
        value={form.categoryId}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            categoryId: e.target.value,
          }))
        }
        className="col-span-2 rounded-xl bg-zinc-800 p-3"
      >
        <option value="">اختر التصنيف</option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name_ar}
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
        placeholder="الاسم بالعربية"
        className="rounded-xl bg-zinc-800 p-3"
      />

      <input
        value={form.nameEn}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            nameEn: e.target.value,
          }))
        }
        placeholder="الاسم بالإنجليزية"
        className="rounded-xl bg-zinc-800 p-3"
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
        className="rounded-xl bg-zinc-800 p-3"
      />

      <input
        type="number"
        value={form.calories}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            calories: e.target.value,
          }))
        }
        placeholder="عدد السعرات"
        className="rounded-xl bg-zinc-800 p-3"
      />

      <textarea
        value={form.descriptionAr}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            descriptionAr: e.target.value,
          }))
        }
        placeholder="الوصف بالعربية"
        className="col-span-2 rounded-xl bg-zinc-800 p-3"
      />

      <textarea
        value={form.descriptionEn}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            descriptionEn: e.target.value,
          }))
        }
        placeholder="الوصف بالإنجليزية"
        className="col-span-2 rounded-xl bg-zinc-800 p-3"
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