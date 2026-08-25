"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Save, Palette, Type, LockKeyhole, ArrowRight } from "lucide-react";
import Link from "next/link";

const defaults = { primary_color: "#EAB308", background_color: "#0A0A0A", surface_color: "#121212" };

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/platform-settings", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر تحميل الإعدادات العامة.");
        setSettings({
          primary_color: data.settings?.primary_color || defaults.primary_color,
          background_color: data.settings?.background_color || defaults.background_color,
          surface_color: data.settings?.surface_color || defaults.surface_color,
        });
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "تعذر تحميل الإعدادات."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حفظ الإعدادات العامة.");
      setMessage("تم حفظ أساسيات المنصة وتطبيقها على جميع المقاهي.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ الإعدادات.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-[#171207] via-[#0c0d12] to-[#07080b] p-7 shadow-2xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-300">
                <ShieldCheck size={15} /> مدير النظام فقط
              </div>
              <h1 className="text-4xl font-black text-yellow-400">الإعدادات العامة للمنصة</h1>
              <p className="mt-2 max-w-3xl text-zinc-400">
                هذه الصفحة تتحكم في أساسيات النظام المشتركة بين المقاهي. لا تحتوي على صور أو شعارات أو أرقام أو عناوين خاصة بأي مقهى.
              </p>
            </div>
            <Link href="/admin/cafes" className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold text-zinc-200 hover:border-yellow-500/40 hover:text-yellow-300">
              <ArrowRight size={17} /> العودة لإدارة المقاهي
            </Link>
          </div>
        </header>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-300">
          <div className="flex items-center gap-2"><LockKeyhole size={18} /> بيانات المقاهي الخاصة لن تتأثر: الصور، الشعار، الهاتف، العنوان، الإيميل، المنتجات والمعرض تبقى منفصلة.</div>
        </div>

        {message && <div className="rounded-2xl border border-white/10 bg-zinc-950 px-5 py-4 font-bold text-yellow-300">{message}</div>}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center text-zinc-500">جاري تحميل الإعدادات العامة...</div>
        ) : (
          <section className="space-y-6 rounded-[2rem] border border-white/10 bg-zinc-950 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400"><Palette size={22} /></div>
              <div><h2 className="text-2xl font-black">أساسيات المظهر</h2><p className="text-sm text-zinc-500">هذه القيم عامة للمنصة، وليست بيانات أي مقهى.</p></div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["primary_color", "اللون الأساسي"],
                ["background_color", "لون الخلفية"],
                ["surface_color", "لون البطاقات والسطوح"],
              ].map(([key, label]) => (
                <label key={key} className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
                  <span className="mb-2 block text-sm font-bold text-zinc-300">{label}</span>
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings[key as keyof typeof settings]} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} className="h-12 w-16 rounded-lg border-0 bg-transparent" />
                    <input value={settings[key as keyof typeof settings]} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-3 py-3 font-mono outline-none focus:border-yellow-500/40" />
                  </div>
                </label>
              ))}
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5">
              <div className="mb-2 flex items-center gap-2 font-black text-yellow-300"><Type size={18} /> بنية الخط والتصميم</div>
              <p className="text-sm leading-7 text-zinc-400">سننقل إعدادات الخط، أحجام العناوين، ترتيب الأقسام، وسلوك المكونات العامة إلى هذه الصفحة تدريجيًا. أي تعديل هناك سيكون تحديثًا للمنصة كلها، بينما تبقى محتويات المقاهي منفصلة.</p>
            </div>

            <button onClick={save} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black hover:bg-yellow-400 disabled:opacity-50">
              <Save size={19} /> {saving ? "جارٍ الحفظ..." : "حفظ وتطبيق على جميع المقاهي"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
