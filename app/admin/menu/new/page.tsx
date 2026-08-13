"use client";

import {
  FormEvent,
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ImagePlus,
  Loader2,
  Save,
  Utensils,
  X,
  Tag,
  CircleDollarSign,
} from "lucide-react";

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
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();

        setCategories(data);

        if (data.length > 0) {
          setCategory(data[0].id);
        }
      } catch (error) {
        console.error(
          "خطأ في تحميل التصنيفات:",
          error
        );
      }
    }

    loadCategories();
  }, []);

  function handleImageChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] ?? null;

    setImage(file);

    if (file) {
      const previewUrl =
        URL.createObjectURL(file);

      setImagePreview(previewUrl);
    } else {
      setImagePreview("");
    }
  }

  function removeImage() {
    setImage(null);
    setImagePreview("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("يرجى كتابة اسم المنتج.");
      return;
    }

    if (!price || Number(price) < 0) {
      alert("يرجى إدخال سعر صحيح.");
      return;
    }

    if (!category) {
      alert("يرجى اختيار التصنيف.");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = "";

      if (image) {
        imageUrl = await uploadMenuImage(image);
      }

      await createMenuItem({
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        image: imageUrl,
        available: true,
        sort_order: 0,
      });

      router.push("/admin/menu");
      router.refresh();
    } catch (error) {
      console.error(
        "خطأ أثناء حفظ المنتج:",
        error
      );

      if (error instanceof Error) {
        alert(
          `حدث خطأ أثناء حفظ المنتج:\n${error.message}`
        );
      } else {
        alert("حدث خطأ أثناء حفظ المنتج.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-8 text-white md:px-8"
    >
      {/* رأس الصفحة */}
      <div className="mx-auto mb-8 max-w-6xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/20">
              <Utensils size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
                إضافة منتج جديد
              </h1>

              <p className="mt-1 text-zinc-400">
                أضف منتجًا جديدًا إلى قائمة المقهى
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/menu")
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-bold text-zinc-200 transition hover:border-yellow-500 hover:text-yellow-400"
          >
            <ArrowRight size={19} />
            العودة إلى المنيو
          </button>
        </div>
      </div>

      {/* المحتوى */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]"
      >
        {/* القسم الرئيسي */}
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5 shadow-2xl md:p-8">
          <div className="mb-7 border-b border-zinc-800 pb-5">
            <h2 className="text-xl font-bold">
              معلومات المنتج
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              أدخل البيانات الأساسية للمنتج
            </p>
          </div>

          <div className="space-y-6">
            {/* اسم المنتج */}
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-200">
                اسم المنتج
              </label>

              <input
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="مثال: إسبريسو"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10"
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-200">
                وصف المنتج
              </label>

              <textarea
                rows={5}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="اكتب وصفًا مختصرًا للمنتج..."
                className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10"
              />
            </div>

            {/* التصنيف والسعر */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-200">
                  <Tag size={17} className="text-yellow-400" />
                  التصنيف
                </label>

                <select
                  required
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10"
                >
                  {categories.length === 0 ? (
                    <option value="">
                      لا توجد تصنيفات
                    </option>
                  ) : (
                    categories.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name_ar}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-200">
                  <CircleDollarSign
                    size={17}
                    className="text-yellow-400"
                  />
                  السعر
                </label>

                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 pl-16 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10"
                  />

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-yellow-400">
                    ر.س
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم الصورة */}
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5 shadow-2xl md:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              صورة المنتج
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              اختر صورة واضحة للمنتج
            </p>
          </div>

          {/* معاينة الصورة */}
          <div className="relative mb-5 aspect-square overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-black">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="معاينة المنتج"
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white transition hover:bg-red-600"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <label className="flex h-full cursor-pointer flex-col items-center justify-center p-6 text-center transition hover:bg-zinc-900">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
                  <ImagePlus size={32} />
                </div>

                <span className="font-bold text-zinc-200">
                  اختر صورة المنتج
                </span>

                <span className="mt-2 text-xs text-zinc-500">
                  PNG أو JPG أو WEBP
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* زر اختيار الصورة عند وجود صورة */}
          {imagePreview && (
            <label className="mb-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-yellow-500 hover:text-yellow-400">
              <ImagePlus size={18} />
              تغيير الصورة

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          {/* زر الحفظ */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-4 font-black text-black shadow-lg shadow-yellow-500/10 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={21}
                  className="animate-spin"
                />
                جارٍ حفظ المنتج...
              </>
            ) : (
              <>
                <Save size={21} />
                حفظ المنتج
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              router.push("/admin/menu")
            }
            className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 font-bold text-zinc-400 transition hover:border-zinc-600 hover:text-white"
          >
            إلغاء
          </button>
        </div>
      </form>
    </main>
  );
}