"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, StarOff } from "lucide-react";

import {
  getSiteControl,
  updateSiteControl,
  type SiteControl,
} from "@/services/siteControl";

const MAX_HOME_GALLERY_IMAGES = 6;

export default function AdminGalleryHomePage() {
  const [settings, setSettings] = useState<SiteControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getSiteControl();
        if (!mounted) return;

        if (data) {
          const images = Array.isArray(data.gallery_images)
            ? data.gallery_images.filter(Boolean)
            : [];
          const home = Array.isArray(data.gallery_images_home)
            ? images.map((_, index) => data.gallery_images_home?.[index] === true)
            : images.map(() => false);

          setSettings({
            ...data,
            gallery_images: images,
            gallery_images_home: home,
          });
        }
      } catch (error) {
        console.error("Failed to load gallery home settings:", error);
        if (mounted) {
          setMessage("حدث خطأ أثناء تحميل صور الصفحة الرئيسية.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  async function toggleHomeImage(index: number) {
    if (!settings) return;

    const images = Array.isArray(settings.gallery_images)
      ? settings.gallery_images.filter(Boolean)
      : [];

    const home = Array.isArray(settings.gallery_images_home)
      ? images.map((_, itemIndex) => settings.gallery_images_home?.[itemIndex] === true)
      : images.map(() => false);

    if (!images[index]) return;

    const nextValue = !home[index];
    const selectedCount = home.filter(Boolean).length;

    if (nextValue && selectedCount >= MAX_HOME_GALLERY_IMAGES) {
      setMessage(`يمكن اختيار ${MAX_HOME_GALLERY_IMAGES} صور فقط للصفحة الرئيسية.`);
      return;
    }

    home[index] = nextValue;
    setSavingIndex(index);
    setMessage("");

    try {
      const updated = await updateSiteControl({
        gallery_images_home: home,
      });

      setSettings(updated);
      setMessage(
        nextValue
          ? "تمت إضافة الصورة إلى الصفحة الرئيسية."
          : "تمت إزالة الصورة من الصفحة الرئيسية."
      );
    } catch (error) {
      console.error("Failed to update home gallery selection:", error);
      setMessage("حدث خطأ أثناء حفظ اختيار الصورة.");
    } finally {
      setSavingIndex(null);
    }
  }

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#0b0b0b] p-6 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-[#121212] p-12 text-center text-zinc-400">
          جاري تحميل صور المعرض...
        </div>
      </main>
    );
  }

  const images = settings?.gallery_images?.filter(Boolean) || [];
  const selectedCount = settings?.gallery_images_home?.filter(Boolean).length || 0;

  return (
    <main dir="rtl" className="min-h-screen bg-[#0b0b0b] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3 text-yellow-400">
                <Star size={24} />
                <span className="font-black">اختيار صور الصفحة الرئيسية</span>
              </div>
              <h1 className="text-3xl font-black sm:text-4xl">حدد الصور التي تريد إظهارها في الرئيسية</h1>
              <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
                كل الصور الموجودة هنا تظهر في صفحة المعرض. اختر حتى ست صور فقط بالنجمة لتظهر في الصفحة الرئيسية.
                إزالة النجمة تعني أن الصورة تبقى في المعرض فقط.
              </p>
            </div>

            <Link
              href="/admin/settings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-black text-zinc-300 transition hover:border-yellow-500/40 hover:text-yellow-400"
            >
              <ArrowRight size={18} />
              الرجوع للإعدادات
            </Link>
          </div>
        </header>

        {message && (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 font-bold text-yellow-300">
            {message}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-[#121212] p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">صور المعرض</h2>
              <p className="mt-1 text-sm text-zinc-500">النجمة هي التي تتحكم في ظهور الصورة بالصفحة الرئيسية.</p>
            </div>
            <div className="rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-black text-yellow-400">
              مختار {selectedCount} / {MAX_HOME_GALLERY_IMAGES}
            </div>
          </div>

          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-zinc-500">
              لا توجد صور في المعرض حاليًا.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => {
                const selected = settings?.gallery_images_home?.[index] === true;
                const saving = savingIndex === index;

                return (
                  <article
                    key={`${image}-${index}`}
                    className={`overflow-hidden rounded-3xl border bg-black/30 transition ${
                      selected
                        ? "border-yellow-500/60 shadow-[0_0_0_1px_rgba(234,179,8,0.15)]"
                        : "border-white/10"
                    }`}
                  >
                    <div className="relative h-64 overflow-hidden bg-zinc-900">
                      <Image
                        src={image}
                        alt={`صورة المعرض ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-black text-white">
                          صورة {index + 1}
                        </span>
                        {selected && (
                          <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-black text-black">
                            تظهر في الرئيسية
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <button
                        type="button"
                        onClick={() => toggleHomeImage(index)}
                        disabled={saving}
                        className={`flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 font-black transition disabled:cursor-wait disabled:opacity-60 ${
                          selected
                            ? "bg-yellow-500 text-black hover:bg-yellow-400"
                            : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-yellow-500/40 hover:text-yellow-400"
                        }`}
                      >
                        {selected ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
                        {saving ? "جارٍ الحفظ..." : selected ? "إزالة النجمة" : "إظهار في الصفحة الرئيسية"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
