"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useCategories } from "@/hooks/useCategories";
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
  const cafeId = searchParams.get("cafe");
  const { items, loading, error, add, update, remove, toggle, refresh } = useMenu();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isPlatform) router.replace("/admin?platform=1#menu");
  }, [isPlatform, router]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [String(c.id), categoryName(c)])), [categories]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || `${item.name} ${item.description}`.toLowerCase().includes(q);
      const matchesCategory = category === "all" || item.category === category;
      const matchesFeatured = !featuredOnly || item.featured;
      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [items, search, category, featuredOnly]);

  function startNew() {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?.id ? String(categories[0].id) : "" });
    setMessage("");
  }

  function startEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      calories: item.calories == null ? "" : String(item.calories),
      image: item.image || "",
      category: item.category,
      available: item.available,
      featured: item.featured,
      sort_order: item.sort_order,
    });
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
    try {
      const payload = {
        name: form.name.trim(), description: form.description.trim(), price, calories,
        image: form.image.trim(), category: form.category, available: form.available,
        featured: form.featured, sort_order: Number(form.sort_order) || 0,
      };
      if (editing) await update({ ...payload, id: editing.id });
      else await add(payload);
      await refresh();
      setMessage(editing ? "تم تحديث المنتج في هذا المقهى." : "تمت إضافة المنتج في هذا المقهى.");
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حفظ المنتج.");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(item: MenuItem) {
    if (!confirm(`حذف المنتج \"${item.name}\" من هذا المقهى؟`)) return;
    try { await remove(item.id); setMessage("تم حذف المنتج."); } catch (err) { setMessage(err instanceof Error ? err.message : "تعذر حذف المنتج."); }
  }

  async function toggleFeatured(item: MenuItem) {
    try {
      await update({ id: item.id, name: item.name, description: item.description, price: item.price, calories: item.calories, image: item.image, category: item.category, available: item.available, featured: !item.featured, sort_order: item.sort_order });
      setMessage(item.featured ? "تمت إزالة المنتج من المميز." : "تمت إضافة المنتج إلى المميز.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "تعذر تغيير المميز."); }
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
            <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400"><Plus size={18} /> إضافة منتج</button>
          </div>
        </header>

        {message && <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 font-bold text-yellow-300">{message}</div>}
        {error && <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-bold text-red-300">{error}</div>}

        {(editing || form.name !== "" || form.category !== "") && (
          <section className="mb-6 rounded-[2rem] border border-yellow-500/20 bg-[#0b0d12] p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-yellow-400">{editing ? "تعديل المنتج" : "إضافة منتج"}</h2><button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl border border-white/10 p-2"><X size={18} /></button></div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="اسم المنتج" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500" />
              <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} type="number" min="0" step="0.01" placeholder="السعر (ر.س)" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500" />
              <input value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} type="number" min="0" step="1" placeholder="السعرات الحرارية" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500" />
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"><option value="">اختر التصنيف</option>{categories.map((c) => <option key={c.id} value={String(c.id)}>{categoryName(c)}</option>)}</select>
              <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="رابط صورة المنتج" className="md:col-span-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500" />
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} placeholder="وصف المنتج" className="md:col-span-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500" />
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3"><input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} /> متوفر</label>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> <Star size={16} className="text-yellow-400" /> منتج مميز</label>
            </div>
            <button type="button" disabled={saving} onClick={() => void save()} className="mt-4 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black disabled:opacity-60">{saving ? "جارٍ الحفظ..." : editing ? "حفظ التعديل" : "إضافة المنتج"}</button>
          </section>
        )}

        <section className="mb-6 rounded-2xl border border-white/10 bg-[#0f1118] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_260px_auto]">
            <div className="relative"><Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث في المنتجات..." className="w-full rounded-xl border border-white/10 bg-black py-3 pr-11 pl-4 outline-none focus:border-yellow-500" /></div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-yellow-500"><option value="all">جميع التصنيفات</option>{categories.map((c) => <option key={c.id} value={String(c.id)}>{categoryName(c)}</option>)}</select>
            <button type="button" onClick={() => setFeaturedOnly((v) => !v)} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold ${featuredOnly ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/10 bg-black text-zinc-300"}`}><Star size={18} fill={featuredOnly ? "currentColor" : "none"} /> المميز فقط</button>
          </div>
        </section>

        {loading ? <div className="rounded-3xl border border-white/10 bg-[#0f1118] p-16 text-center text-zinc-500">جاري تحميل المنيو...</div> : filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-white/10 bg-[#0f1118] p-16 text-center text-zinc-500">لا توجد منتجات.</div> : <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12]"><div className="relative h-52 bg-zinc-900">{item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl">☕</div>}<button type="button" onClick={() => void toggleFeatured(item)} title="تبديل المميز" className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border ${item.featured ? "border-yellow-400 bg-yellow-400 text-black" : "border-white/20 bg-black/70 text-white"}`}><Star size={21} fill={item.featured ? "currentColor" : "none"} /></button><div className="absolute right-4 top-4">{item.available ? <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">متوفر</span> : <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">مخفي</span>}</div></div><div className="p-5"><h2 className="text-xl font-black">{item.name}</h2><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">{categoryMap.get(String(item.category)) || "تصنيف غير معروف"}</span>{item.calories != null && <span className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">{item.calories} سعرة</span>}</div><p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{item.description || "لا يوجد وصف."}</p><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => startEdit(item)} className="rounded-xl bg-blue-500/10 px-3 py-3 font-bold text-blue-300"><Pencil size={15} className="inline ml-1" /> تعديل</button><button type="button" onClick={() => void toggle(item.id, !item.available)} className="rounded-xl bg-orange-500/10 px-3 py-3 font-bold text-orange-300">{item.available ? <><EyeOff size={15} className="inline ml-1" /> إخفاء</> : <><Eye size={15} className="inline ml-1" /> إظهار</>}</button><button type="button" onClick={() => void removeItem(item)} className="col-span-2 rounded-xl bg-red-500/10 px-3 py-3 font-bold text-red-300"><Trash2 size={15} className="inline ml-1" /> حذف المنتج</button></div></div></article>)}</section>}
      </div>
    </main>
  );
}
