"use client";

import { useEffect, useState } from "react";
import { Palette, Save, LayoutGrid } from "lucide-react";

const defaults = {
  menu_title: "المنيو",
  menu_subtitle: "اختر ما يناسب ذوقك ثم أضفه إلى السلة.",
  menu_columns_desktop: 3,
  menu_card_style: "classic",
  menu_card_radius: "xl",
  menu_card_shadow: true,
  menu_show_images: true,
  menu_show_descriptions: true,
  menu_show_prices: true,
  menu_show_featured_badge: true,
  menu_show_search: false,
  menu_category_style: "sections",
  menu_category_sticky: false,
  menu_section_spacing: "large",
  menu_image_ratio: "landscape",
  menu_card_background: "surface",
  menu_card_border: true,
  menu_price_color: "accent",
  menu_accent_color: "#EAB308",
};

export default function PlatformMenuDesignPanel() {
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/platform-settings", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result?.error || "تعذر تحميل إعدادات تصميم المنيو.");
        if (!active) return;
        setForm({ ...defaults, ...(result?.settings?.foundation || {}) });
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "تعذر تحميل الإعدادات.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof typeof defaults>(key: K, value: (typeof defaults)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const currentResponse = await fetch("/api/admin/platform-settings", { cache: "no-store" });
      const current = await currentResponse.json().catch(() => ({}));
      if (!currentResponse.ok) throw new Error(current?.error || "تعذر قراءة إعدادات المنصة الحالية.");

      const response = await fetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          foundation: {
            ...(current?.settings?.foundation || {}),
            ...form,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "تعذر حفظ تصميم المنيو.");
      setForm({ ...defaults, ...(result?.settings?.foundation || {}) });
      setMessage("تم حفظ تصميم المنيو وسيظهر على المواقع الثلاثة.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ تصميم المنيو.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-sm text-zinc-500">جاري تحميل إعدادات تصميم المنيو...</div>;
  }

  return (
    <div dir="rtl" className="mb-6 rounded-3xl border border-yellow-500/20 bg-[#0b0d12] p-5 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400"><Palette size={21} /></div>
          <div>
            <h3 className="text-xl font-black text-white">تصميم المنيو المركزي</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-500">هذه الإعدادات للشكل والهيكل، وتُطبق على همسة مزاج ومقهى الاختبار وأي مقهى جديد.</p>
          </div>
        </div>
        <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400 disabled:opacity-60">
          <Save size={18} /> {saving ? "جارٍ الحفظ..." : "حفظ تصميم المنيو"}
        </button>
      </div>

      {message && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-yellow-300">{message}</div>}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="md:col-span-2"><span className="mb-2 block text-xs font-bold text-zinc-400">عنوان المنيو</span><input value={String(form.menu_title)} onChange={(e) => update("menu_title", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500" /></label>
        <label className="md:col-span-2"><span className="mb-2 block text-xs font-bold text-zinc-400">وصف المنيو</span><input value={String(form.menu_subtitle)} onChange={(e) => update("menu_subtitle", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-500" /></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">عدد الأعمدة على الكمبيوتر</span><select value={String(form.menu_columns_desktop)} onChange={(e) => update("menu_columns_desktop", Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="2">عمودان</option><option value="3">3 أعمدة</option><option value="4">4 أعمدة</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">شكل بطاقة المنتج</span><select value={String(form.menu_card_style)} onChange={(e) => update("menu_card_style", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="classic">كلاسيكي</option><option value="minimal">بسيط</option><option value="luxury">فاخر</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">استدارة البطاقات</span><select value={String(form.menu_card_radius)} onChange={(e) => update("menu_card_radius", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="none">بدون</option><option value="lg">متوسطة</option><option value="xl">كبيرة</option><option value="2xl">كبيرة جدًا</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">نسبة صورة المنتج</span><select value={String(form.menu_image_ratio)} onChange={(e) => update("menu_image_ratio", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="square">مربعة</option><option value="landscape">أفقية</option><option value="portrait">طولية</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">عرض التصنيفات</span><select value={String(form.menu_category_style)} onChange={(e) => update("menu_category_style", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="sections">أقسام كبيرة</option><option value="tabs">تبويبات</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">المسافة بين الأقسام</span><select value={String(form.menu_section_spacing)} onChange={(e) => update("menu_section_spacing", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="small">صغيرة</option><option value="medium">متوسطة</option><option value="large">كبيرة</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">خلفية البطاقة</span><select value={String(form.menu_card_background)} onChange={(e) => update("menu_card_background", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="surface">سطح داكن</option><option value="transparent">شفافة</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">لون السعر</span><select value={String(form.menu_price_color)} onChange={(e) => update("menu_price_color", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"><option value="accent">اللون الرئيسي</option><option value="white">أبيض</option><option value="muted">هادئ</option></select></label>
        <label><span className="mb-2 block text-xs font-bold text-zinc-400">لون إبراز المنيو</span><div className="flex gap-2"><input type="color" value={String(form.menu_accent_color)} onChange={(e) => update("menu_accent_color", e.target.value)} className="h-12 w-16 rounded-xl border border-white/10 bg-zinc-900 p-1" /><input value={String(form.menu_accent_color)} onChange={(e) => update("menu_accent_color", e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white" /></div></label>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["menu_show_images", "إظهار صور المنتجات"],
          ["menu_show_descriptions", "إظهار الوصف"],
          ["menu_show_prices", "إظهار الأسعار"],
          ["menu_show_featured_badge", "شارة المنتج المميز"],
          ["menu_show_search", "إظهار البحث"],
          ["menu_category_sticky", "تثبيت التصنيفات"],
          ["menu_card_shadow", "ظل البطاقات"],
          ["menu_card_border", "إطار البطاقات"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-zinc-300">
            <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => update(key, e.target.checked)} />
            <LayoutGrid size={15} className="text-yellow-400" />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
