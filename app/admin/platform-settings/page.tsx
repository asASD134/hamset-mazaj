"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, ImagePlus, LayoutDashboard, Palette, Save, Settings2, Sparkles, Star, Type, Upload, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

type PlatformState = {
  version: string;
  primary_color: string;
  background_color: string;
  surface_color: string;
  foundation: Record<string, any>;
  preview_assets: Record<string, any>;
};

const sectionDefaults = ["hero", "featured", "why", "matches", "gallery", "testimonials", "contact", "footer"];

const toggleLabels: Record<string, string> = {
  hero_enabled: "القسم الرئيسي",
  featured_enabled: "المميز",
  why_enabled: "لماذا نحن",
  matches_enabled: "المباريات",
  gallery_enabled: "المعرض",
  testimonials_enabled: "آراء العملاء",
  contact_enabled: "التواصل",
  footer_enabled: "الفوتر",
  show_logo: "الشعار",
  show_site_name: "اسم الموقع",
  show_tagline: "الشعار النصي",
  show_hero_title: "عنوان Hero",
  show_hero_description: "وصف Hero",
  show_hero_background: "خلفية Hero",
  show_gallery_title: "عنوان المعرض",
  show_gallery_description: "وصف المعرض",
  show_gallery_images: "صور المعرض",
  show_contact_address: "عنوان التواصل",
  show_contact_phone: "هاتف التواصل",
  show_contact_hours: "أوقات العمل",
  show_contact_map: "الخريطة",
  show_contact_social_links: "التواصل الاجتماعي",
};

const typographyKeys = [
  ["hero_title", "عنوان Hero"],
  ["hero_subtitle", "العنوان الفرعي"],
  ["hero_description", "وصف Hero"],
  ["featured_title", "عنوان المميز"],
  ["featured_product_name", "اسم المنتج"],
  ["gallery_title", "عنوان المعرض"],
  ["contact_title", "عنوان التواصل"],
  ["footer_text", "نص الفوتر"],
] as const;

function normalizeTypography(value: any) {
  const out: Record<string, { desktop: number; mobile: number }> = {};
  for (const [key] of typographyKeys) {
    const item = value?.[key];
    out[key] = {
      desktop: Number(item?.desktop || 18),
      mobile: Number(item?.mobile || 16),
    };
  }
  return out;
}

export default function PlatformSettingsPage() {
  const [state, setState] = useState<PlatformState>({ version: "1.0.0", primary_color: "#EAB308", background_color: "#0A0A0A", surface_color: "#121212", foundation: {}, preview_assets: {} });
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/platform-settings", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر تحميل إعدادات المنصة.");
        setState((current) => ({
          ...current,
          ...(data.settings || {}),
          foundation: data.settings?.foundation || {},
          preview_assets: data.settings?.preview_assets || {},
        }));
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "تعذر تحميل إعدادات المنصة."))
      .finally(() => setLoading(false));
  }, []);

  const foundation = state.foundation || {};
  const typography = useMemo(() => normalizeTypography(foundation.typography || state.foundation?.global_typography || {}), [foundation.typography, state.foundation?.global_typography]);

  function setFoundation(key: string, value: any) {
    setState((current) => ({ ...current, foundation: { ...current.foundation, [key]: value } }));
  }

  function setTypography(key: string, device: "desktop" | "mobile", value: number) {
    setState((current) => ({
      ...current,
      foundation: {
        ...current.foundation,
        typography: {
          ...(current.foundation.typography || {}),
          [key]: { ...(current.foundation.typography?.[key] || {}), [device]: value },
        },
      },
    }));
  }

  async function save() {
    setSaving(true); setMessage("");
    try {
      const payload = {
        primary_color: state.primary_color,
        background_color: state.background_color,
        surface_color: state.surface_color,
        foundation: {
          ...state.foundation,
          primary_color: state.primary_color,
          background_color: state.background_color,
          surface_color: state.surface_color,
          typography: state.foundation.typography || typography,
          section_order: state.foundation.section_order || sectionDefaults,
        },
        preview_assets: state.preview_assets,
      };
      const res = await fetch("/api/admin/platform-settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حفظ الإعدادات.");
      setState((current) => ({ ...current, ...data.settings }));
      setMessage(`تم حفظ ونشر تحديث المنصة ${data.settings?.version || ""} على جميع المقاهي.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ الإعدادات.");
    } finally { setSaving(false); }
  }

  async function uploadPreviewAsset(kind: "logo" | "hero" | "gallery") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      setUploading(kind);
      try {
        const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const path = `platform-preview/${kind}-${Date.now()}.${extension}`;
        const { error } = await supabase.storage.from("site-assets").upload(path, file, { cacheControl: "3600", contentType: file.type });
        if (error) throw error;
        const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
        setState((current) => ({ ...current, preview_assets: { ...current.preview_assets, [kind]: data.publicUrl } }));
        setMessage("تم رفع أصل المعاينة. احفظ لتثبيت التحديث.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "تعذر رفع الملف.");
      } finally { setUploading(null); }
    };
    input.click();
  }

  if (loading) return <main dir="rtl" className="min-h-screen bg-black p-10 text-white"><div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center text-zinc-500">جاري تحميل مساحة الإدارة العامة...</div></main>;

  return (
    <main dir="rtl" className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-[#171207] via-[#0c0d12] to-[#07080b] p-6 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-300"><ShieldIcon /> مدير النظام</div>
              <h1 className="text-3xl font-black text-yellow-400 sm:text-4xl">الإعدادات العامة للمنصة</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">هذه هي مساحة التطوير الفعلية للنظام. ما تحفظه هنا يطبق على طريقة عمل وتصميم كل المقاهي، بينما أصول المعاينة هنا تبقى خاصة بالمعاينة ولا تنتقل لأي مقهى.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/platform-preview?cafe=test-cafe" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-black text-black hover:bg-yellow-400"><ExternalLink size={17}/> معاينة المنصة</a>
              <Link href="/admin/cafes" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-zinc-200 hover:border-yellow-500/30"><LayoutDashboard size={17}/> إدارة المقاهي</Link>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-emerald-300">إصدار المنصة: {state.version}</span>
            <span className="rounded-full bg-white/5 px-3 py-2 text-zinc-400">آخر حفظ يتحول إلى تحديث فعلي</span>
          </div>
        </header>

        {message && <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 font-bold text-yellow-300">{message}</div>}

        <div className="mb-6 grid gap-2 sm:grid-cols-5">
          {[
            ["overview", "نظرة عامة", Sparkles],
            ["appearance", "المظهر", Palette],
            ["layout", "الأقسام", Settings2],
            ["type", "الخطوط", Type],
            ["preview", "أصول المعاينة", ImagePlus],
          ].map(([key, label, Icon]: any) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black ${tab === key ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" : "border-white/10 bg-zinc-950 text-zinc-400 hover:text-white"}`}><Icon size={17}/>{label}</button>
          ))}
        </div>

        {tab === "overview" && <section className="grid gap-5 md:grid-cols-3">
          {[
            ["المظهر العام", "الألوان، السطح، الخطوط، الإحساس البصري.", "appearance"],
            ["هيكل الموقع", "الأقسام، إظهار وإخفاء العناصر، وترتيبها.", "layout"],
            ["المعرض", "سلوك الصور والتكبير والتنقل يكون من أساسيات المنصة.", "preview"],
          ].map(([title, desc, target]) => <button key={target} onClick={() => setTab(target)} className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 text-right hover:border-yellow-500/20"><div className="mb-3 text-xl font-black text-yellow-300">{title}</div><p className="text-sm leading-7 text-zinc-500">{desc}</p></button>)}
          <div className="md:col-span-3 rounded-[2rem] border border-blue-500/15 bg-blue-500/5 p-6 text-sm leading-7 text-blue-100">قاعدة المنصة: اسم المقهى، الهاتف، العنوان، الشعار الفعلي، صور المقهى، المعرض الخاص به، منتجاته وحسابه تظل داخل المقهى نفسه. هذه اللوحة تتحكم في النظام فقط.</div>
        </section>}

        {tab === "appearance" && <section className="space-y-6 rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
          <div className="flex items-center gap-3"><Palette className="text-yellow-400"/><div><h2 className="text-2xl font-black">المظهر العام للمنصة</h2><p className="text-sm text-zinc-500">تغييرات حقيقية مشتركة بين المقاهي.</p></div></div>
          <div className="grid gap-5 md:grid-cols-3">{[["primary_color","اللون الأساسي"],["background_color","الخلفية"],["surface_color","البطاقات"]].map(([key,label]) => <label key={key} className="rounded-2xl border border-white/10 bg-black p-4"><span className="mb-2 block text-sm font-bold text-zinc-300">{label}</span><div className="flex gap-3"><input type="color" value={state[key as keyof PlatformState] as string} onChange={e=>setState(s=>({...s,[key]:e.target.value}))} className="h-12 w-14 rounded-lg"/><input value={state[key as keyof PlatformState] as string} onChange={e=>setState(s=>({...s,[key]:e.target.value}))} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 font-mono"/></div></label>)}</div>
        </section>}

        {tab === "layout" && <section className="space-y-6 rounded-[2rem] border border-white/10 bg-zinc-950 p-6">
          <div><h2 className="text-2xl font-black">هيكل الموقع وسلوكه</h2><p className="text-sm text-zinc-500">هذه القيم تتحول إلى أساس مشترك لكل المقاهي.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(toggleLabels).map(([key,label]) => <button key={key} onClick={()=>setFoundation(key, foundation[key] === false ? true : false)} className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-right ${foundation[key] === false ? "border-red-500/15 bg-red-500/5 text-zinc-400" : "border-emerald-500/15 bg-emerald-500/5 text-emerald-200"}`}><span className="font-bold">{label}</span><span className="text-xs font-black">{foundation[key] === false ? "مخفى" : "ظاهر"}</span></button>)}</div>
          <div className="rounded-2xl border border-white/10 bg-black p-5"><div className="mb-3 font-black text-yellow-300">ترتيب الأقسام</div><div className="flex flex-wrap gap-2">{(foundation.section_order || sectionDefaults).map((item:string, index:number)=><span key={item} className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold">{index+1}. {item}</span>)}</div></div>
        </section>}

        {tab === "type" && <section className="space-y-6 rounded-[2rem] border border-white/10 bg-zinc-950 p-6"><div><h2 className="text-2xl font-black">الخطوط والأحجام</h2><p className="text-sm text-zinc-500">تحكم مركزي في أحجام النصوص الأساسية.</p></div><div className="grid gap-4 md:grid-cols-2">{typographyKeys.map(([key,label])=><div key={key} className="rounded-2xl border border-white/10 bg-black p-4"><div className="mb-3 font-black text-zinc-200">{label}</div><div className="grid grid-cols-2 gap-3"><label className="text-xs text-zinc-500">ديسكتوب<input type="number" min="10" max="100" value={typography[key]?.desktop} onChange={e=>setTypography(key,"desktop",Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-white"/></label><label className="text-xs text-zinc-500">موبايل<input type="number" min="10" max="80" value={typography[key]?.mobile} onChange={e=>setTypography(key,"mobile",Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-3 text-white"/></label></div></div>)}</div></section>}

        {tab === "preview" && <section className="space-y-6 rounded-[2rem] border border-white/10 bg-zinc-950 p-6"><div><h2 className="text-2xl font-black">أصول المعاينة العامة</h2><p className="text-sm leading-7 text-zinc-500">هذه الصور تستخدم فقط لعرض المنصة أثناء التطوير. لا يتم نسخها إلى أي مقهى.</p></div><div className="grid gap-5 md:grid-cols-3">{[["logo","شعار المعاينة"],["hero","خلفية Hero للمعاينة"],["gallery","صورة معرض للمعاينة"]].map(([key,label])=><div key={key} className="rounded-2xl border border-white/10 bg-black p-4"><div className="mb-3 font-black text-zinc-200">{label}</div>{state.preview_assets[key] ? <img src={state.preview_assets[key]} alt="" className="mb-3 h-40 w-full rounded-xl object-cover"/> : <div className="mb-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-600">لا توجد صورة</div>}<button onClick={()=>void uploadPreviewAsset(key as any)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 font-bold text-yellow-300"><Upload size={17}/>{uploading===key?"جارٍ الرفع...":"رفع صورة للمعاينة"}</button></div>)}</div></section>}

        <div className="sticky bottom-4 z-20 rounded-[2rem] border border-yellow-500/20 bg-black/90 p-3 shadow-2xl backdrop-blur"><button onClick={()=>void save()} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black hover:bg-yellow-400 disabled:opacity-50"><Save size={19}/>{saving?"جارٍ النشر...":"حفظ ونشر تحديث المنصة على جميع المقاهي"}</button></div>
      </div>
    </main>
  );
}

function ShieldIcon(){ return <Zap size={15}/>; }
