"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createMenuItem } from "@/services/menu";
import {
  getCategories,
  Category,
} from "@/services/categories";
import { uploadMenuImage } from "@/services/storage";

export default function NewMenuItemPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();

      setCategories(data);

      if (data.length > 0) {
        setCategory(data[0].id);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      let imageUrl = "";

      if (image) {
        imageUrl = await uploadMenuImage(image);
      }

      await createMenuItem({
        name,
        description,
        category,
        price: Number(price),
        image: imageUrl,
        available: true,
        sort_order: 0,
      });

      router.push("/admin/menu");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ المنتج.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-4xl font-bold text-yellow-400">
        إضافة منتج جديد
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
            required
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black p-3"
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
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
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-bold">
            صورة المنتج
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
          disabled={loading}
          className="w-full rounded-xl bg-yellow-500 py-4 font-bold text-black hover:bg-yellow-400 disabled:opacity-60"
        >
          {loading ? "جارٍ الحفظ..." : "حفظ المنتج"}
        </button>
      </form>
    </main>
  );
}