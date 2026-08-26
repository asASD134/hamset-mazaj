"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { ImagePlus, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useCategories } from "@/hooks/useCategories";
import { uploadMenuImage } from "@/services/storage";
import type { MenuItem } from "@/types/menu";

const emptyForm = {
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

type FormState = typeof emptyForm;
const platformContext = { platform: true } as const;

async function publish(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/platform-settings/apply-menu", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok !== true) {
    throw new Error(data?.error || "تعذر نشر التغيير على المقاهي.");
  }
  return data;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-black text-zinc-200">
        {label}{required ? <span className="mr-1 text-red-400">*</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function PlatformMenuPanelV2() {
  const { items, loading, error, refresh, toggle: toggleAvailable } = useMenu(platformContext);
  const { categories } = useCategories();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(q)) : items;
  }, [items, search]);

  function openNew() {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?.id ? String(categories[0].id) : "" });
    setImageFile(null);
    setPreview("");
    setMessage("");
  }

  function openEdit(item: MenuItem) {
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
    setImageFile(null);
    setPreview(item.image || "");
    setMessage("");
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setPreview("");
  }

  function handleImage(file: File | null) {
    setImageFile(file);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : form.image);
  }

  async function save() {
    if (!form.name.trim() || !form.category || !form.price) {
      setMessage("أكمل اسم المنتج والسعر والتصنيف أولًا.");
      return;
    }
    const price = Number(form.price);
    const calories = form.calories.trim() === "" ? null : Number(form.calories);
    if (!Number.isFinite(price) || price < 0) {
      setMessage("السعر غير صحيح.");
      return;
    }
    if (calories !== null && (!Number.isFinite(calories) || calories < 0)) {
      setMessage("السعرات الحرارية غير صحيحة.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      let image = form.image.trim();
      if (imageFile) image = await uploadMenuImage(imageFile);

      const item = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        calories,
        image,
        category: form.category,
        available: form.available,
        featured: form.featured,
        sort_order: Number(form.sort_order) || 0,
      };

      if (editing) {
        await publish({ action: "update", id: editing.id, item });
        setMessage("تم تحديث المنتج ونشره على المقاهي.");
      } else {
        await publish({ action: "create", item });
        setMessage("تمت إضافة المنتج ونشره على جميع المقاهي.");
      }
      await refresh();
      closeForm();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حفظ المنتج.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(item: MenuItem) {
    try {
      await publish({
        action: "update",
        id: item.id,
        item: {
          name: item.name,
          description: item.description,
          price: item.price,
          calories: item.calories,
          image: item.image,
          category: item.category,
          available: item.available,
          featured: !item.featured,
          sort_order: item.sort_order,
        },
      });
      await refresh();
      setMessage(item.featured ? "تمت إزالة المنتج من المميز." : "تمت إضافة المنتج إلى المميز.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر تغيير حالة المميز.");
    }
  }

  async function remove(item: MenuItem) {
    if (!window.confirm(`حذف «${item.name}» من جميع المقاهي؟`)) return;
    try {
      await publish({ action: "delete", id: item.id });
      await refresh();
      setMessage("تم حذف المنتج من المقاهي.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر حذف المنتج.");
    }
  }

  return (
    <section dir="rtl" className="rounded-3xl border border-white/10 bg-[#0b0d12] p-5 text-white sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-black text-yellow-400">إدارة المنيو والمنتجات</h3>
          <p className="mt-1 text-sm text-zinc-500">إضافة وتعديل المنتجات من الإدارة العامة ونشرها على المقاهي.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400">
          <Plus size={18} /> إضافة منتج جديد
        </button>
      </div>

      {message && <div className="mt-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">{message}</div>}
      {error && <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</div>}

      {(editing || form !== emptyForm) && (
        <div className="mt-6 rounded-3xl border border-yellow-500/20 bg-black/40 p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div><h4 className="text-xl font-black">{editing ? "تعديل منتج" : "إضافة منتج جديد"}</h4><p className="mt-1 text-xs text-zinc-500">الحقول التي عليها * مطلوبة.</p></div>
            <button type="button" onClick={closeForm} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white"><X size={18} /></button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="اسم المنتج" required><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: كابتشينو" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 text-white outline-none focus:border-yellow-500" /></Field>
            <Field label="السعر (ريال سعودي)" required><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 text-white outline-none focus:border-yellow-500" /></Field>
            <Field label="السعرات الحرارية"><input type="number" min="0" step="1" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} placeholder="مثال: 180" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 text-white outline-none focus:border-yellow-500" /></Field>
            <Field label="تصنيف المنتج" required><select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 text-white outline-none focus:border-yellow-500"><option value="">اختر التصنيف</option>{categories.map((cat) => <option key={cat.id} value={String(cat.id)}>{cat.name_ar}</option>)}</select></Field>
            <Field label="وصف المنتج"><textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="اكتب وصفًا مختصرًا للمنتج..." className="lg:col-span-2 w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 text-white outline-none focus:border-yellow-500" /></Field>

            <Field label="صورة المنتج">
              <div className="overflow-hidden rounded-2xl border border-dashed border-white/15 bg-zinc-950">
                {preview ? <div className="relative"><img src={preview} alt="معاينة صورة المنتج" className="h-48 w-full object-cover" /><button type="button" onClick={() => handleImage(null)} className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-600"><X size={18} /></button></div> : <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center"><ImagePlus size={36} className="text-yellow-400" /><div className="font-black">ارفع صورة المنتج من جهازك</div><div className="text-xs text-zinc-500">PNG أو JPG أو WEBP</div></div>}
                <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-white/10 bg-zinc-900 px-4 py-3 font-bold text-zinc-200 hover:text-yellow-400"><ImagePlus size={18} /> {preview ? "تغيير الصورة" : "اختيار صورة"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => handleImage(e.target.files?.[0] ?? null)} className="hidden" /></label>
              </div>
              <div className="mt-3"><span className="mb-2 block text-xs font-bold text-zinc-500">أو أدخل رابط صورة</span><input value={form.image} onChange={(e) => { setForm((f) => ({ ...f, image: e.target.value })); if (!imageFile) setPreview(e.target.value); }} placeholder="https://..." className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500" /></div>
            </Field>

            <div className="space-y-3">
              <div className="text-sm font-black text-zinc-200">حالة المنتج</div>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3"><input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} /> متوفر للزبائن</label>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /><Star size={17} className="text-yellow-400" /> منتج مميز ⭐</label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-black text-black hover:bg-yellow-400 disabled:opacity-50"><Save size={18} />{saving ? "جارٍ الحفظ..." : editing ? "حفظ ونشر" : "إضافة ونشر للجميع"}</button>
            <button type="button" onClick={closeForm} className="rounded-xl border border-white/10 px-6 py-3 font-bold text-zinc-300">إلغاء</button>
          </div>
        </div>
      )}

      <div className="mt-6"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنتج أو الوصف..." className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500" /></div>

      {loading ? <div className="py-10 text-center text-zinc-500">جاري تحميل المنتجات...</div> : <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"><div className="relative">{item.image ? <img src={item.image} alt={item.name} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-zinc-900 text-4xl">☕</div>}<button type="button" onClick={() => void toggleFeatured(item)} title={item.featured ? "إزالة من المميز" : "إضافة للمميز"} className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border ${item.featured ? "border-yellow-400 bg-yellow-400 text-black" : "border-white/20 bg-black/70 text-white hover:border-yellow-400 hover:text-yellow-400"}`}><Star size={20} fill={item.featured ? "currentColor" : "none"} /></button></div><div className="p-4"><h4 className="font-black text-white">{item.name}</h4><p className="mt-1 text-xs text-zinc-500">{item.calories != null ? `${item.calories} سعرة حرارية` : "السعرات غير محددة"}</p><p className="mt-2 text-lg font-black text-yellow-400">{Number(item.price).toFixed(2)} ر.س</p><p className="mt-2 min-h-10 text-sm text-zinc-500">{item.description || "بدون وصف"}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => openEdit(item)} className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 font-bold text-blue-300"><Pencil size={15} /> تعديل</button><button type="button" onClick={() => void toggleAvailable(item.id, !item.available)} className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 font-bold text-orange-300">{item.available ? "إخفاء" : "إظهار"}</button><button type="button" onClick={() => void remove(item)} className="col-span-2 inline-flex items-center justify-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 font-bold text-red-300"><Trash2 size={15} /> حذف من المقاهي</button></div></div></article>)}</div>}
    </section>
  );
}
