"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useCategories } from "@/hooks/useCategories";
import { uploadMenuImage } from "@/services/storage";
import type { MenuItem } from "@/types/menu";

type FormState = {
  name: string;
  description: string;
  price: string;
  calories: string;
  image: string;
  category: string;
  available: boolean;
  featured: boolean;
  sort_order: number;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  calories: "",
  image: "",
  category: "",
  available: true,
  featured: false,
  sort_order: 0,
};

const FALLBACK_CATEGORIES: Record<number, string> = {
  1: "القهوة الساخنة",
  2: "القهوة الباردة",
  3: "المشروبات",
  4: "الحلويات",
  5: "الوجبات الخفيفة",
  6: "العروض الخاصة",
  7: "المشروبات الصحية",
  8: "الإضافات",
  9: "المنتجات الجديدة",
  10: "المشروبات المميزة",
  11: "ركن القهوة",
};

function categoryName(category: { name_ar?: string | null; sort_order?: number | null; id: string | number }) {
  const name = String(category.name_ar ?? "").trim();
  return name && !/^\d+$/.test(name)
    ? name
    : FALLBACK_CATEGORIES[Number(category.sort_order)] ?? `تصنيف ${category.sort_order ?? category.id}`;
}

export default function AdminMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPlatform = searchParams.get("platform") === "1";
  const { items, loading, error, add, update, remove, toggle, refresh } = useMenu();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isPlatform) router.replace("/admin?platform=1#menu");
  }, [isPlatform, router]);

  const categoryEntries = useMemo(
    () => categories.map((c) => ({ id: String(c.id), name: categoryName(c) })),
    [categories]
  );

  const countsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = String(item.category);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  const featuredCount = useMemo(() => items.filter((item) => item.featured).length, [items]);
  const availableCount = useMemo(() => items.filter((item) => item.available).length, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || `${item.name} ${item.description}`.toLowerCase().includes(q);
      const matchesCategory = category === "all" || String(item.category) === category;
      const matchesFeatured = !featuredOnly || item.featured;
      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [items, search, category, featuredOnly]);

  const selectedCount = useMemo(() => {
    if (category === "all") return featuredOnly ? featuredCount : items.length;
    const categoryCount = countsByCategory.get(category) ?? 0;
    return featuredOnly
      ? items.filter((item) => String(item.category) === category && item.featured).length
      : categoryCount;
  }, [category, countsByCategory, featuredOnly, featuredCount, items]);

  function closeEditor() {
    setEditorOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
  }

  function startNew() {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?.id ? String(categories[0].id) : "" });
    setImageFile(null);
    setImagePreview("");
    setMessage("");
    setEditorOpen(true);
  }

  function startEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      calories: item.calories == null ? "" : String(item.calories),
      image: item.image || "",
      category: String(item.category),
      available: item.available,
      featured: item.featured,
      sort_order: item.sort_order,
    });
    setImageFile(null);
    setImagePreview(item.image || "");
    setMessage("");
    setEditorOpen(true);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setForm((current) => ({ ...current, image: "" }));
    }
  }

  async function save() {
    const price = Number(form.price);
    const calories = form.calories.trim() === "" ? null : Number(form.calories);
    if (!form.name.trim() || !form.category || !Number.isFinite(price) || price < 0) {
      setMessage("أكمل اسم المنتج والسعر والتصنيف.");
      return;
    }
    if (calories !== null && (!Number.isFinite(calories) || calories < 0)) {
      setMessage("السعرات الحرارية غير صحيحة.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const imageUrl = imageFile ? await uploadMenuImage(imageFile) : form.image.trim();
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        calories,
        image: imageUrl,
        category: form.category,
        available: form.available,
        featured: form.featured,
        sort_order: Number(form.sort_order) || 0,
      };

      if (editing) {
        await update({ ...payload, id: editing.id });
        setMessage("تم تعديل المنتج بنجاح في هذا المقهى.");
      } else {
        await add(payload);
        setMessage("تمت إضافة المنتج بنجاح في هذا المقهى.");
      }
      await refresh();
      closeEditor();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حفظ المنتج.");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(item: MenuItem) {
    if (!window.confirm(`حذف المنتج «${item.name}» من هذا المقهى؟`)) return;
    try {
      await remove(item.id);
      setMessage("تم حذف المنتج.");
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حذف المنتج.");
    }
  }

  async function toggleFeatured(item: MenuItem) {
    try {
      await update({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        calories: item.calories,
        image: item.image,
        category: item.category,
        available: item.available,
        featured: !item.featured,
        sort_order: item.sort_order,
      });
      await refresh();
      setMessage(item.featured ? "تمت إزالة المنتج من المميز." : "تمت إضافة المنتج إلى المميز.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر تغيير حالة المميز.");
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      await toggle(item.id, !item.available);
      setMessage(item.available ? "تم إخفاء المنتج." : "تم إظهار المنتج.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر تغيير حالة التوفر.");
    }
  }

  if (isPlatform) return <div dir="rtl" className="min-h-screen bg-black text-white" />;

  return (
    <main dir="rtl" className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-yellow-500/20 bg-[#0b0d12] p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-yellow-400">إدارة المقهى</p>
              <h1 className="mt-1 text-3xl font-black">المنيو والمنتجات</h1>
              <p className="mt-2 text-sm text-zinc-500">إدارة مستقلة لهذا المقهى فقط.</p>
            </div>
            <button type="button" onClick={startNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400">
              <Plus size={18} /> إضافة منتج جديد
            </button>
          </div>

          {message && <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">{message}</div>}
          {error && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</div>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="text-xs font-bold text-zinc-500">إجمالي المنتجات</div>
              <div className="mt-1 text-3xl font-black">{items.length}</div>
              <div className="text-xs text-zinc-600">منتج</div>
            </div>
            <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.04] p-4">
              <div className="text-xs font-bold text-zinc-500">المنتجات المميزة ⭐</div>
              <div className="mt-1 text-3xl font-black text-yellow-400">{featuredCount}</div>
              <div className="text-xs text-zinc-600">منتج مميز</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="text-xs font-bold text-zinc-500">المنتجات المتوفرة</div>
              <div className="mt-1 text-3xl font-black">{availableCount}</div>
              <div className="text-xs text-zinc-600">متاح الآن</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="text-xs font-bold text-zinc-500">نتائج العرض الحالي</div>
              <div className="mt-1 text-3xl font-black text-yellow-400">{filtered.length}</div>
              <div className="text-xs text-zinc-600">{selectedCount} حسب التصنيف/المميز</div>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px_190px]">
              <div>
                <label htmlFor="menu-search" className="mb-2 block text-sm font-black text-white">بحث</label>
                <div className="relative">
                  <Search size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input id="menu-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="مثال: كابتشينو" className="w-full rounded-xl border border-white/10 bg-black px-11 py-3.5 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500" />
                </div>
                <p className="mt-2 text-xs text-zinc-600">عدد النتائج: <span className="font-bold text-zinc-300">{filtered.length}</span></p>
              </div>

              <div>
                <label htmlFor="menu-category" className="mb-2 block text-sm font-black text-white">تصنيف المنتجات</label>
                <select id="menu-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 text-white outline-none focus:border-yellow-500">
                  <option value="all">جميع التصنيفات ({items.length})</option>
                  {categoryEntries.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({countsByCategory.get(entry.id) ?? 0})</option>)}
                </select>
                <p className="mt-2 text-xs text-zinc-600">المحدد الآن: <span className="font-bold text-zinc-300">{selectedCount}</span> منتج</p>
              </div>

              <div>
                <span className="mb-2 block text-sm font-black text-white">المنتجات المميزة</span>
                <button type="button" onClick={() => setFeaturedOnly((current) => !current)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 font-bold transition ${featuredOnly ? "border-yellow-400 bg-yellow-500/10 text-yellow-300" : "border-white/10 bg-black text-zinc-300"}`}>
                  <span className="inline-flex items-center gap-2"><Star size={18} fill={featuredOnly ? "currentColor" : "none"} /> المميز فقط</span>
                  <span className="rounded-full bg-yellow-500 px-2.5 py-1 text-xs font-black text-black">{featuredCount}</span>
                </button>
              </div>
            </div>
          </div>

          {editorOpen && (
            <section className="mt-6 rounded-3xl border border-yellow-500/20 bg-black/50 p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{editing ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
                  <p className="mt-1 text-sm text-zinc-500">العنوان فوق الحقل، والمثال داخل الحقل.</p>
                </div>
                <button type="button" onClick={closeEditor} className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-bold">اسم المنتج</span>
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="مثال: كابتشينو" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 outline-none focus:border-yellow-500" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold">السعر</span>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="مثال: 18.00" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 outline-none focus:border-yellow-500" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold">السعرات الحرارية</span>
                  <input type="number" min="0" step="1" value={form.calories} onChange={(event) => setForm((current) => ({ ...current, calories: event.target.value }))} placeholder="مثال: 120" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 outline-none focus:border-yellow-500" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-bold">تصنيف المنتج</span>
                  <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 outline-none focus:border-yellow-500">
                    <option value="">اختر تصنيف المنتج</option>
                    {categoryEntries.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({countsByCategory.get(entry.id) ?? 0})</option>)}
                  </select>
                </label>

                <div className="lg:col-span-2">
                  <span className="mb-2 block text-sm font-bold">صورة المنتج</span>
                  <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <label htmlFor="menu-image" className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-black p-5 text-center hover:border-yellow-500/50">
                      <ImagePlus size={32} className="mb-3 text-yellow-400" />
                      <span className="font-black">اختيار صورة من الكمبيوتر</span>
                      <span className="mt-1 text-xs text-zinc-500">PNG / JPG / WEBP</span>
                      <input id="menu-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" />
                    </label>
                    <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-black">
                      {imagePreview ? <img src={imagePreview} alt="معاينة المنتج" className="h-full min-h-36 w-full object-cover" /> : <div className="flex min-h-36 items-center justify-center text-zinc-700"><ImagePlus size={36} /></div>}
                    </div>
                  </div>
                  <input value={form.image} onChange={(event) => { setForm((current) => ({ ...current, image: event.target.value })); setImagePreview(event.target.value); }} placeholder="مثال: https://example.com/product.jpg" className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500" />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-4">
                  <input type="checkbox" checked={form.available} onChange={(event) => setForm((current) => ({ ...current, available: event.target.checked }))} className="h-5 w-5 accent-yellow-500" />
                  <span className="font-bold">المنتج متوفر</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-4">
                  <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="h-5 w-5 accent-yellow-500" />
                  <Star size={19} className="text-yellow-400" fill={form.featured ? "currentColor" : "none"} />
                  <span className="font-bold">منتج مميز</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-yellow-500 px-6 py-3 font-black text-black disabled:opacity-60">{saving ? "جارٍ الحفظ..." : editing ? "حفظ التعديل" : "إضافة المنتج"}</button>
                <button type="button" onClick={closeEditor} className="rounded-xl border border-white/10 px-6 py-3 font-bold">إلغاء</button>
              </div>
            </section>
          )}
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#0b0d12] p-12 text-center text-zinc-500">جاري تحميل المنيو...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#0b0d12] p-12 text-center">
              <Search className="mx-auto mb-4 text-zinc-700" size={34} />
              <p className="font-bold text-zinc-400">لا توجد منتجات مطابقة.</p>
              <p className="mt-1 text-sm text-zinc-600">غيّر البحث أو التصنيف أو ألغِ فلتر المميز.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12]">
                  <div className="relative">
                    {item.image ? <img src={item.image} alt={item.name} className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center bg-zinc-900 text-5xl">☕</div>}
                    <button type="button" onClick={() => void toggleFeatured(item)} title={item.featured ? "إزالة من المميز" : "إضافة للمميز"} className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border ${item.featured ? "border-yellow-400 bg-yellow-400 text-black" : "border-white/20 bg-black/70 text-white"}`}>
                      <Star size={21} fill={item.featured ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black">{item.name}</h3>
                        <p className="mt-1 text-xs font-bold text-yellow-400">{categoryMap.get(String(item.category)) ?? "بدون تصنيف"}</p>
                      </div>
                      <span className="whitespace-nowrap text-lg font-black text-yellow-400">{item.price} ر.س</span>
                    </div>
                    {item.description && <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{item.description}</p>}
                    {item.calories != null && <p className="mt-2 text-xs font-bold text-zinc-500">🔥 {item.calories} سعرة حرارية</p>}

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => void toggleAvailability(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm font-bold text-zinc-300">
                        {item.available ? <EyeOff size={16} /> : <Eye size={16} />}
                        {item.available ? "إخفاء" : "إظهار"}
                      </button>
                      <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2.5 text-sm font-bold text-blue-400"><Pencil size={16} /> تعديل</button>
                      <button type="button" onClick={() => void removeItem(item)} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm font-bold text-red-400"><Trash2 size={16} /> حذف المنتج</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
