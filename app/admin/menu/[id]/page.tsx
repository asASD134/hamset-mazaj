"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getMenuItem,
  updateMenuItem,
} from "@/services/menu";

import {
  Category,
  getCategories,
} from "@/services/categories";

import {
  uploadMenuImage,
  deleteMenuImage,
} from "@/services/storage";

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [product, cats] = await Promise.all([
          getMenuItem(id),
          getCategories(),
        ]);

        if (!product) {
          alert("المنتج غير موجود");
          router.push("/admin/menu");
          return;
        }

        setCategories(cats);

        setName(product.name);
        setDescription(product.description);
        setCategoryId(product.category);
        setPrice(String(product.price));
        setImageUrl(product.image);
        setAvailable(product.available);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);

      let newImageUrl = imageUrl;

      if (image) {
        const uploadedUrl = await uploadMenuImage(image);

        if (imageUrl) {
          await deleteMenuImage(imageUrl);
        }

        newImageUrl = uploadedUrl;
      }

      await updateMenuItem({
        id,
        name,
        description,
        category: categoryId,
        price: Number(price),
        image: newImageUrl,
        available,
        sort_order: 0,
      });

      router.push("/admin/menu");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ التعديلات.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-xl">
        جاري تحميل المنتج...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-4xl font-bold text-yellow-400">
        تعديل المنتج
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-yellow-500/20 bg-zinc-900 p-8"
      >
        <div>
          <label className="mb-2 block font-bold">
            اسم المنتج
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-bold">
            الوصف
          </label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-bold">
            التصنيف
          </label>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black p-3"
          >
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-bold">
            السعر
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black p-3"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="available"
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />

          <label htmlFor="available">
            المنتج متوفر
          </label>
        </div>

        {imageUrl && (
          <div>
            <label className="mb-2 block font-bold">
              الصورة الحالية
            </label>

            <img
              src={imageUrl}
              alt={name}
              className="h-48 w-48 rounded-xl border border-yellow-500/20 object-cover"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block font-bold">
            تغيير الصورة
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files?.[0] ?? null)
            }
            className="w-full rounded-lg border border-zinc-700 bg-black p-3"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-yellow-500 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-60"
        >
          {saving
            ? "جارٍ حفظ التعديلات..."
            : "حفظ التعديلات"}
        </button>
      </form>
    </main>
  );
}