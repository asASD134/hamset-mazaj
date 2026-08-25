import getCafeSettings from "@/lib/getCafeSettings";
import { getSocialLinks } from "@/services/socialLinks";

import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Globe2,
  ExternalLink,
} from "lucide-react";

function unwrapRedirectUrl(value?: string | null) {
  if (!value) return null;

  const clean = value.trim();

  if (!clean) return null;

  try {
    const parsed = new URL(clean);

    if (
      parsed.hostname === "l.instagram.com" &&
      parsed.searchParams.get("u")
    ) {
      return decodeURIComponent(
        parsed.searchParams.get("u")!
      );
    }
  } catch {
    // تجاهل الخطأ
  }

  return clean;
}

function extractUrl(value?: string | null) {
  if (!value) return null;

  const clean = value.trim();

  if (!clean) return null;

  const match = clean.match(
    /https?:\/\/[^\s]+/i
  );

  if (match?.[0]) {
    return unwrapRedirectUrl(match[0]);
  }

  return unwrapRedirectUrl(clean);
}

function normalizeLinkUrl(value: string) {
  const clean = value.trim();

  if (!clean) {
    return "#";
  }

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("mailto:") ||
    clean.startsWith("tel:")
  ) {
    return clean;
  }

  return `https://${clean}`;
}

function getFaviconUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return null;
    }

    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      parsed.hostname
    )}&sz=64`;
  } catch {
    return null;
  }
}

function isMail(url: string) {
  return url.startsWith("mailto:");
}

function isPhone(url: string) {
  return url.startsWith("tel:");
}

export default async function ContactPage() {
  const [settings, socialLinks] =
    await Promise.all([
      getCafeSettings(),
      getSocialLinks(),
    ]);

  const cafeName =
    settings.cafe_name || "همسة مزاج";

  const address =
    settings.address ||
    "الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء";

  const phone =
    settings.phone || "0594165122";

  const openingHours =
    settings.opening_hours ||
    "مفتوح 24 ساعة";

  const mapsUrl =
    extractUrl(settings.maps_url);

  const activeLinks = socialLinks
    .filter((link) => link.is_active)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order
    );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#050505] text-white"
    >
      {/* العنوان */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#080808] px-5 py-20 sm:px-8 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.08),transparent_42%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs font-bold tracking-[0.2em] text-yellow-400 sm:text-sm">
            تواصل معنا
          </span>

          <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl md:text-6xl">
            يسعدنا استقبالكم
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            جميع معلومات التواصل والموقع والحسابات الرسمية
            لـ {cafeName} في مكان واحد.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* معلومات التواصل */}
          <div className="space-y-4 lg:col-span-5">

            {/* العنوان */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black">
                  <MapPin size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    الموقع
                  </h2>

                  <p className="mt-2 leading-7 text-zinc-400">
                    {address}
                  </p>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-yellow-400 transition hover:text-yellow-300"
                    >
                      فتح الموقع
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* الهاتف */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black">
                  <Phone size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    الهاتف
                  </h2>

                  <a
                    href={`tel:${phone}`}
                    className="mt-2 block text-zinc-400 transition hover:text-yellow-400"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            </div>

            {/* أوقات العمل */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black">
                  <Clock3 size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    أوقات العمل
                  </h2>

                  <p className="mt-2 text-zinc-400">
                    {openingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* مواقع التواصل */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black">
                  <Globe2 size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    مواقع التواصل
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    حساباتنا وروابطنا الرسمية
                  </p>
                </div>
              </div>

              {activeLinks.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {activeLinks.map((link) => {
                    const href =
                      normalizeLinkUrl(link.url);

                    const favicon =
                      getFaviconUrl(href);

                    const mail =
                      isMail(href);

                    const phoneLink =
                      isPhone(href);

                    return (
                      <a
                        key={link.id}
                        href={href}
                        target={
                          mail || phoneLink
                            ? undefined
                            : "_blank"
                        }
                        rel={
                          mail || phoneLink
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-bold text-zinc-200 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/30 hover:bg-yellow-500 hover:text-black"
                      >
                        <span className="flex h-7 w-7 items-center justify-center">
                          {mail ? (
                            <Mail size={19} />
                          ) : phoneLink ? (
                            <Phone size={19} />
                          ) : favicon ? (
                            <img
                              src={favicon}
                              alt=""
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <Globe2 size={19} />
                          )}
                        </span>

                        <span>
                          {link.name}
                        </span>

                        <ExternalLink
                          size={14}
                          className="opacity-50 transition group-hover:opacity-100"
                        />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  لا توجد مواقع تواصل مضافة حاليًا.
                </p>
              )}
            </div>
          </div>

          {/* الخريطة */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] lg:col-span-7">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-2xl font-black text-white">
                موقع المقهى
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {address}
              </p>
            </div>

            <div className="p-3 sm:p-4">
              <iframe
                title={`موقع ${cafeName}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  address
                )}&output=embed`}
                className="h-[420px] w-full rounded-2xl border-0 sm:h-[520px]"
                loading="lazy"
              />
            </div>

            {mapsUrl && (
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-3.5 font-black text-black transition hover:bg-yellow-400"
                >
                  <MapPin size={19} />
                  فتح الموقع في Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}