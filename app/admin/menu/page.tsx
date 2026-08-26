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

function categoryName(category: { name_ar?: string; sort_order?: number; id: string }) {
  const name = String(category.name_ar ?? "").trim();
  return name && !/^\d+$/.test(name) ? name : `تصنيف ${category.sort_order ?? category.id}`;
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

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [String(c.id), categoryName(c)])),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || `${item.name} ${item.description}`.toLowerCase().includes(q);
      const matchesCategory = category === "all" || String(item.category) === category;
      const matchesFeatured = !featuredOnly || item.featured;
      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [items, search, category, featuredOnly]);

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
      let imageUrl = form.image.trim();
      if (imageFile) imageUrl = await uploadMenuImage(imageFile);

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

  if (isPlatform) return <div dir="rtl" className="min-h-screen bg-black text-white" />;

  return (
    <main dir="rtl" className="min-h-screen bg-[#06070b] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 rounded-[2rem] border border-yellow-500/20 bg-[#0f1118] p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black text-yellow-400">إدارة المقهى</div>
              <h1 className="mt-2 text-3xl font-black">المنيو والمنتجات</h1>
              <p className="mt-2 text-sm text-zinc-500">إدارة مستقلة لهذا المقهى فقط.</p>
            </div>
            <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400">
              <Plus size={18} /> إضافة منتج جديد
            </button>
          </div>
        </header>

        {message && <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 font-bold text-yellow-300">{message}</div>}
        {error && <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-bold text-red-300">{error}</div>}

        {editorOpen && (
          <section className="mb-6 rounded-[2rem] border border-yellow-500/25 bg-[#0b0d12] p-5 shadow-2xl sm:p-7">
            <div className="mb-7 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="text-xs font-black text-yellow-400">نموذج المنتج</div>
                <h2 className="mt-1 text-2xl font-black text-white">{editing ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
                <p className="mt-1 text-sm text-zinc-500">العنوان فوق الخانة، والمثال داخل الخانة.</p>
              </div>
              <button type="button" onClick={closeEditor} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:border-red-500/40 hover:text-red-400"><X size={20} /></button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-white">اسم المنتج</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: كابتشينو" className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 outline-none placeholder:text-zinc-600 focus:border-yellow-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-white">السعر</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="مثال: 18.00 ريال" className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 outline-none placeholder:text-zinc-600 focus:border-yellow-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-white">السعرات الحرارية</label>
                <input type="number" min="0" step="1" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} placeholder="مثال: 120 سعرة حرارية" className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 outline-none placeholder:text-zinc-600 focus:border-yellow-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-white">تصنيف المنتج</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 outline-none focus:border-yellow-500">
                  <option value="">اختر تصنيف المنتج</option>
                  {categories.map((c) => <option key={c.id} value={String(c.id)}>{categoryName(c)}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-black text-white">وصف المنتج</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} placeholder="مثال: قهوة إسبريسو مع حليب مبخر ورغوة ناعمة." className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3.5 outline-none placeholder:text-zinc-600 focus:border-yellow-500" />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-black text-white">صورة المنتج</label>
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div className="rounded-2xl border border-dashed border-zinc-700 bg-black p-5">
                    <label htmlFor="menu-product-image" className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-950 px-6 py-8 text-center transition hover:border-yellow-500/50 hover:bg-zinc-900">
                      <ImagePlus size={42} className="mb-3 text-yellow-400" />
                      <span className="text-lg font-black text-white">اختيار صورة من الكمبيوتر</span>
                      <span className="mt-2 text-sm text-zinc-500">اضغط هنا لفتح ملفات جهازك واختيار صورة المنتج</span>
                      <span className="mt-3 text-xs text-zinc-600">PNG / JPG / WEBP</span>
                      <input id="menu-product-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" />
                    </label>
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-bold text-zinc-500">أو استخدم رابط صورة</div>
                      <input value={form.image} onChange={(e) => { setForm((f) => ({ ...f, image: e.target.value })); setImageFile(null); setImagePreview(e.target.value); }} placeholder="https://example.com/product.jpg" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-yellow-500" />
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-black">
                    {imagePreview ? <img src={imagePreview} alt="معاينة صورة المنتج" className="h-full min-h-64 w-full object-cover" /> : <div className="flex min-h-64 flex-col items-center justify-center text-zinc-700"><ImagePlus size={48} /><span className="mt-3 text-sm">معاينة الصورة</span></div>}
                  </div>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 px-5 py-4">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} className="h-5 w-5 accent-yellow-500" />
                <span><span className="block font-black text-white">المنتج متوفر</span><span className="text-xs text-zinc-500">يظهر للزوار بشكل طبيعي</span></span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 px-5 py-4">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="h-5 w-5 accent-yellow-500" />
                <Star size={20} className="text-yellow-400" fill={form.featured ? "currentColor" : "none"} />
                <span><span className="block font-black text-white">منتج مميز ⭐</span><span className="text-xs text-zinc-500">يظهر ضمن المنتجات المميزة</span></span>
              </label>
            </div>

            <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-7 py-3.5 font-black text-black hover:bg-yellow-400 disabled:opacity-60">{saving ? "جارٍ الحفظ..." : editing ? "حفظ التعديل" : "إضافة المنتج"}</button>
              <button type="button" disabled={saving} onClick={closeEditor} className="rounded-xl border border-white/10 px-7 py-3.5 font-bold text-zinc-300 hover:border-white/20 hover:text-white">إلغاء</button>
            </div>
          </section>
        )}

        <section className="mb-6 rounded-2xl border border-white/10 bg-[#0f1118] p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px_auto]">
            <div>
              <label className="mb-2 block text-xs font-black text-zinc-400">البحث عن منتج</label>
              <div className="relative"><Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="مثال: كابتشينو" className="w-full rounded-xl border border-white/10 bg-black py-3 pr-11 pl-4 outline-none focus:border-yellow-500" /></div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black text-zinc-400">تصنيف المنتجات</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"><option value="all">جميع التصنيفات</option>{categories.map((c) => <option key={c.id} value={String(c.id)}>{categoryName(c)}</option>)}</select>
            </div>
            <button type="button" onClick={() => setFeaturedOnly((v) => !v)} className={`self-end inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold ${featuredOnly ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/10 bg-black text-zinc-300"}`}><Star size={18} fill={featuredOnly ? "currentColor" : "none"} /> المميز فقط</button>
          </div>
        </section>

        {loading ? <div className="rounded-3xl border border-white/10 bg-[#0f1118] p-16 text-center text-zinc-500">جاري تحميل المنيو...</div> : filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-white/10 bg-[#0f1118] p-16 text-center text-zinc-500">لا توجد منتجات.</div> : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12] shadow-xl">
                <div className="relative h-52 bg-zinc-900">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl">☕</div>}
                  <button type="button" onClick={() => void toggleFeatured(item)} title={item.featured ? "إزالة من المنتجات المميزة" : "إضافة إلى المنتجات المميزة"} className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border ${item.featured ? "border-yellow-400 bg-yellow-400 text-black" : "border-white/20 bg-black/70 text-white hover:border-yellow-400 hover:text-yellow-400"}`}><Star size={21} fill={item.featured ? "currentColor" : "none"} /></button>
                  <div className="absolute right-4 top-4">{item.available ? <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">متوفر</span> : <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">مخفي</span>}</div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-black text-white">{item.name}</h2>
                  <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">{categoryMap.get(String(item.category)) || "تصنيف غير معروف"}</span>{item.calories != null && <span className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">{item.calories} سعرة حرارية</span>}</div>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{item.description || "لا يوجد وصف."}</p>
                  <div className="mt-5 flex items-center justify-between gap-3"><div className="text-2xl font-black text-yellow-400">{Number(item.price).toFixed(2)} <span className="text-xs text-zinc-500">ر.س</span></div>{item.featured && <span className="text-sm font-black text-yellow-400">⭐ مميز</span>}</div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-3 font-bold text-blue-300 hover:bg-blue-500/20"><Pencil size={16} /> تعديل</button>
                    <button type="button" onClick={() => void toggle(item.id, !item.available)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3 font-bold text-orange-300 hover:bg-orange-500/20">{item.available ? <EyeOff size={16} /> : <Eye size={16} />} {item.available ? "إخفاء" : "إظهار"}</button>
                    <button type="button" onClick={() => void removeItem(item)} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 font-bold text-red-300 hover:bg-red-500/20"><Trash2 size={16} /> حذف المنتج</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
