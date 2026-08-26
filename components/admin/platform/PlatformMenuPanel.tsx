"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";

import { useMenu } from "@/hooks/useMenu";
import { useCategories } from "@/hooks/useCategories";
import type { MenuItem } from "@/types/menu";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "",
  available: true,
  featured: false,
  sort_order: 0,
};

type FormState = typeof emptyForm;

const PLATFORM_MENU_CONTEXT = { platform: true } as const;

export default function PlatformMenuPanel() {
  const { items, loading, error, add, update, remove, toggle, refresh } = useMenu(PLATFORM_MENU_CONTEXT);
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.description}`.toLowerCase().includes(q)
    );
  }, [items, search]);

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
      image: item.image || "",
      category: item.category,
      available: item.available,
      featured: item.featured,
      sort_order: item.sort_order,
    });
    setMessage("");
  }

  function closeEditor() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function save() {
    if (!form.name.trim() || !form.category || !form.price) {
      setMessage("اكتب اسم المنتج والسعر واختر التصنيف.");
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setMessage("السعر غير صحيح.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        image: form.image.trim(),
        category: form.category,
        available: form.available,
        featured: form.featured,
        sort_order: Number(form.sort_order) || 0,
      };

      if (editing) {
        await update({ ...payload, id: editing.id });
        setMessage("تم تحديث المنتج ونشره على المقاهي بنجاح.");
      } else {
        await add(payload);
        setMessage("تمت إضافة المنتج ونشره على المقاهي بنجاح.");
      }
      closeEditor();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حفظ المنتج.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: MenuItem) {
    if (!window.confirm(`هل تريد حذف المنتج "${item.name}" من جميع المقاهي؟`)) return;
    try {
      await remove(item.id);
      setMessage("تم حذف المنتج من المقاهي.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حذف المنتج.");
    }
  }

  return (
    <div dir="rtl" className="rounded-3xl border border-white/10 bg-[#0b0d12] p-5 text-white sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-black text-yellow-400">إدارة المنيو والمنتجات</h3>
          <p className="mt-1 text-sm text-zinc-500">هذه اللوحة تعمل دائمًا في وضع الإدارة العامة وتنشر تغييرات المنيو للمقاهي.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-black text-black hover:bg-yellow-400">
            <Plus size={18} /> إضافة منتج
          </button>
          <button type="button" onClick={() => void refresh()} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-300 hover:border-yellow-500/30 hover:text-yellow-400">
            تحديث
          </button>
        </div>
      </div>

      {message && <div className="mt-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">{message}</div>}
      {error && <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</div>}

      {editing !== null || form === emptyForm ? null : null}
      {(editing || form !== emptyForm) && (
        <div className="mt-6 rounded-3xl border border-yellow-500/20 bg-black/40 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xl font-black">{editing ? "تعديل المنتج" : "إضافة منتج جديد"}</h4>
              <p className="mt-1 text-xs text-zinc-500">التعديل من هنا يُنشر للمقاهي كلها.</p>
            </div>
            <button type="button" onClick={closeEditor} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="اسم المنتج" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500" />
            <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} type="number" min="0" step="0.01" placeholder="السعر" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500" />
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500">
              <option value="">اختر التصنيف</option>
              {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name_ar}</option>)}
            </select>
            <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="رابط صورة المنتج" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500" />
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} placeholder="وصف المنتج" className="lg:col-span-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500" />
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3"><input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} /> متوفر</label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> <Star size={16} className="text-yellow-400" /> منتج مميز</label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400 disabled:opacity-60"><Save size={18} /> {saving ? "جارٍ الحفظ..." : "حفظ ونشر"}</button>
            <button type="button" onClick={closeEditor} className="rounded-xl border border-white/10 px-5 py-3 font-bold text-zinc-300">إلغاء</button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث داخل المنتجات..." className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500" />
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-white/10 p-10 text-center text-zinc-500">جاري تحميل المنيو...</div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">لا توجد منتجات.</div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
              {item.image ? <img src={item.image} alt={item.name} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-zinc-900 text-4xl">☕</div>}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h4 className="font-black text-white">{item.name}</h4><p className="mt-1 text-xs text-zinc-500">{Number(item.price).toFixed(2)} ر.س</p></div>
                  {item.featured && <Star size={18} fill="currentColor" className="text-yellow-400" />}
                </div>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm text-zinc-500">{item.description || "بدون وصف"}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => startEdit(item)} className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 font-bold text-blue-300"><Pencil size={15} className="inline ml-1" /> تعديل</button>
                  <button type="button" onClick={() => void toggle(item.id, !item.available)} className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 font-bold text-orange-300">{item.available ? "إخفاء ونشر" : "إظهار ونشر"}</button>
                  <button type="button" onClick={() => void deleteItem(item)} className="col-span-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 font-bold text-red-300"><Trash2 size={15} className="inline ml-1" /> حذف من المقاهي</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
