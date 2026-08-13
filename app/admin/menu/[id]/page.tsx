"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

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

import {
  ArrowRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Save,
  Tag,
  Utensils,
  X,
} from "lucide-react";

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [available, setAvailable] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [product, cats] =
          await Promise.all([
            getMenuItem(id),
            getCategories(),
          ]);

        if (!product) {
          alert("المنتج غير موجود");
          router.push("/admin/menu");
          return;
        }

        setCategories(cats);

        setName(product.name ?? "");

        setDescription(
          product.description ?? ""
        );

        setCategoryId(
          product.category ?? ""
        );

        setPrice(
          String(product.price ?? "")
        );

        setImageUrl(
          product.image ?? ""
        );

        setAvailable(
          product.available
        );
      } catch (error) {
        console.error(
          "خطأ أثناء تحميل المنتج:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل المنتج."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  function handleImageChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0] ?? null;

    setImage(file);

    if (file) {
      const preview =
        URL.createObjectURL(file);

      setImagePreview(preview);
    } else {
      setImagePreview("");
    }
  }

  function removeNewImage() {
    setImage(null);
    setImagePreview("");
  }

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    if (!name.trim()) {
      alert("يرجى كتابة اسم المنتج.");
      return;
    }

    if (!categoryId) {
      alert("يرجى اختيار التصنيف.");
      return;
    }

    if (
      !price ||
      Number(price) < 0
    ) {
      alert("يرجى إدخال سعر صحيح.");
      return;
    }

    try {
      setSaving(true);

      let newImageUrl =
        imageUrl;

      if (image) {
        const uploadedUrl =
          await uploadMenuImage(
            image
          );

        if (imageUrl) {
          await deleteMenuImage(
            imageUrl
          );
        }

        newImageUrl =
          uploadedUrl;
      }

      await updateMenuItem({
        id,
        name: name.trim(),
        description:
          description.trim(),
        category: categoryId,
        price: Number(price),
        image: newImageUrl,
        available,
        sort_order: 0,
      });

      alert(
        "تم حفظ التعديلات بنجاح."
      );

      router.push(
        "/admin/menu"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "خطأ أثناء حفظ التعديلات:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حفظ التعديلات."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black px-4 py-8 text-white md:px-8"
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 px-8 py-7 text-center shadow-xl">
            <Loader2
              size={40}
              className="mx-auto mb-4 animate-spin text-yellow-400"
            />

            <p className="font-bold text-zinc-200">
              جاري تحميل المنتج...
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              يرجى الانتظار
            </p>
          </div>
        </div>
      </main>
    );
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
                تعديل المنتج
              </h1>

              <p className="mt-1 text-zinc-400">
                تعديل بيانات المنتج وصورته وحالته
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              router.push(
                "/admin/menu"
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-bold text-zinc-200 transition hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-50"
          >
            <ArrowRight size={19} />
            العودة إلى المنيو
          </button>
        </div>
      </div>

      {/* النموذج */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]"
      >
        {/* معلومات المنتج */}
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5 shadow-2xl md:p-8">
          <div className="mb-7 border-b border-zinc-800 pb-5">
            <h2 className="text-xl font-bold">
              معلومات المنتج
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              عدّل البيانات الأساسية للمنتج
            </p>
          </div>

          <div className="space-y-6">
            {/* الاسم */}
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
                placeholder="اسم المنتج"
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
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="وصف المنتج..."
                className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10"
              />
            </div>

            {/* التصنيف والسعر */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-200">
                  <Tag
                    size={17}
                    className="text-yellow-400"
                  />
                  التصنيف
                </label>

                <select
                  required
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10"
                >
                  <option value="">
                    اختر التصنيف
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name_ar}
                      </option>
                    )
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
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
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

            {/* حالة المنتج */}
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white">
                    حالة المنتج
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    تحكم في ظهور المنتج للعملاء
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAvailable(
                      (value) => !value
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    available
                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  {available ? (
                    <>
                      <Eye size={18} />
                      متوفر
                    </>
                  ) : (
                    <>
                      <EyeOff size={18} />
                      غير متوفر
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* الصورة والأزرار */}
        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5 shadow-2xl md:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              صورة المنتج
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              الصورة الحالية أو صورة جديدة
            </p>
          </div>

          {/* الصورة */}
          <div className="relative mb-5 aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-black">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="الصورة الجديدة"
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={
                    removeNewImage
                  }
                  className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white transition hover:bg-red-600"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-3 py-1.5 text-xs font-bold text-yellow-400">
                  صورة جديدة
                </div>
              </>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <label className="flex h-full cursor-pointer flex-col items-center justify-center p-6 text-center transition hover:bg-zinc-900">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
                  <ImagePlus size={32} />
                </div>

                <span className="font-bold text-zinc-200">
                  لا توجد صورة
                </span>

                <span className="mt-2 text-xs text-zinc-500">
                  اضغط لاختيار صورة
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* تغيير الصورة */}
          <label className="mb-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-bold text-zinc-200 transition hover:border-yellow-500 hover:text-yellow-400">
            <ImagePlus size={18} />

            {imagePreview
              ? "تغيير الصورة الجديدة"
              : "اختيار صورة جديدة"}

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
              className="hidden"
            />
          </label>

          {/* حالة الصورة */}
          <div className="mb-5 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="text-xs text-zinc-500">
              عند اختيار صورة جديدة سيتم رفعها
              واستبدال الصورة الحالية تلقائيًا
              بعد حفظ التعديلات.
            </p>
          </div>

          {/* حفظ */}
          <button
            type="submit"
            disabled={
              saving ||
              !name.trim() ||
              !categoryId ||
              !price
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-4 font-black text-black shadow-lg shadow-yellow-500/10 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={21}
                  className="animate-spin"
                />
                جارٍ حفظ التعديلات...
              </>
            ) : (
              <>
                <Save size={21} />
                حفظ التعديلات
              </>
            )}
          </button>

          {/* إلغاء */}
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              router.push(
                "/admin/menu"
              )
            }
            className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 font-bold text-zinc-400 transition hover:border-zinc-600 hover:text-white disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </form>
    </main>
  );
}