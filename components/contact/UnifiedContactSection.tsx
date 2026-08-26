import {
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  Phone,
} from "lucide-react";

export type ContactSocialItem = {
  id: string;
  name: string;
  url: string;
  icon?: React.ReactNode;
};

type UnifiedContactSectionProps = {
  title?: string | null;
  description?: string | null;
  cafeName?: string | null;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  mapsUrl?: string | null;
  showTitle?: boolean;
  showDescription?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showHours?: boolean;
  showMap?: boolean;
  showSocial?: boolean;
  socialItems?: ContactSocialItem[];
  compact?: boolean;
};

function normalizeUrl(value: string) {
  const clean = value.trim();
  if (!clean) return "#";
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

function faviconUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=64`;
  } catch {
    return null;
  }
}

function ContactCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-yellow-500/20">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/10">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black text-white">{title}</h3>
          <div className="mt-2 text-sm leading-7 text-zinc-400">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedContactSection({
  title = "يسعدنا استقبالكم",
  description = "جميع معلومات التواصل والموقع والحسابات الرسمية في مكان واحد.",
  cafeName,
  address,
  phone,
  openingHours,
  mapsUrl,
  showTitle = true,
  showDescription = true,
  showAddress = true,
  showPhone = true,
  showHours = true,
  showMap = true,
  showSocial = true,
  socialItems = [],
  compact = false,
}: UnifiedContactSectionProps) {
  const safeAddress = address || "لم يتم إدخال العنوان بعد";
  const safePhone = phone || "لم يتم إدخال رقم الهاتف بعد";
  const safeHours = openingHours || "لم يتم إدخال أوقات العمل بعد";
  const safeMap = mapsUrl?.trim() || "";

  return (
    <section dir="rtl" className={compact ? "bg-transparent py-10" : "bg-[#0d0d0d] py-20"}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {(showTitle || showDescription) && (
          <div className="mb-10 text-center sm:mb-14">
            {showTitle && (
              <>
                <span className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs font-bold tracking-[0.18em] text-yellow-400">
                  تواصل معنا
                </span>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl md:text-5xl">
                  {title || "يسعدنا استقبالكم"}
                </h2>
              </>
            )}
            {showDescription && (
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                {description || `جميع معلومات التواصل والموقع لـ ${cafeName || "المقهى"} في مكان واحد.`}
              </p>
            )}
          </div>
        )}

        <div className={showMap ? "grid gap-6 lg:grid-cols-12" : "mx-auto max-w-3xl"}>
          <div className="space-y-4 lg:col-span-5">
            {showAddress && (
              <ContactCard icon={<MapPin size={22} />} title="الموقع">
                <p>{safeAddress}</p>
                {safeMap && (
                  <a
                    href={safeMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 font-bold text-yellow-400 hover:text-yellow-300"
                  >
                    فتح الموقع
                    <ExternalLink size={14} />
                  </a>
                )}
              </ContactCard>
            )}

            {showPhone && (
              <ContactCard icon={<Phone size={22} />} title="الهاتف">
                <a href={`tel:${safePhone}`} className="transition hover:text-yellow-400">
                  {safePhone}
                </a>
              </ContactCard>
            )}

            {showHours && (
              <ContactCard icon={<Clock3 size={22} />} title="أوقات العمل">
                <p>{safeHours}</p>
              </ContactCard>
            )}

            {showSocial && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-yellow-500/20">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/10">
                    <Globe2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">مواقع التواصل</h3>
                    <p className="mt-1 text-sm text-zinc-500">حساباتنا وروابطنا الرسمية</p>
                  </div>
                </div>

                {socialItems.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {socialItems.map((item) => {
                      const href = normalizeUrl(item.url);
                      const favicon = faviconUrl(href);
                      const icon = item.icon || (favicon ? (
                        <img src={favicon} alt="" className="h-5 w-5 rounded-full" />
                      ) : <Globe2 size={18} />);

                      return (
                        <a
                          key={item.id}
                          href={href}
                          target={href.startsWith("tel:") || href.startsWith("mailto:") ? undefined : "_blank"}
                          rel={href.startsWith("tel:") || href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                          className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-bold text-zinc-200 transition hover:-translate-y-0.5 hover:border-yellow-500/30 hover:bg-yellow-500 hover:text-black"
                        >
                          <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
                          <span>{item.name}</span>
                          <ExternalLink size={13} className="opacity-50 transition group-hover:opacity-100" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">لا توجد مواقع تواصل مضافة حاليًا.</p>
                )}
              </div>
            )}
          </div>

          {showMap && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] lg:col-span-7">
              <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                <h3 className="text-xl font-black text-white">موقع المقهى</h3>
                <p className="mt-1 text-sm text-zinc-500">{safeAddress}</p>
              </div>
              <div className="p-3 sm:p-4">
                {safeMap ? (
                  <iframe
                    title={`موقع ${cafeName || "المقهى"}`}
                    src={`${safeMap}${safeMap.includes("?") ? "&output=embed" : "?output=embed"}`}
                    className="h-[380px] w-full rounded-2xl border-0 sm:h-[520px]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center sm:min-h-[520px]">
                    <div>
                      <MapPin size={44} className="mx-auto mb-4 text-yellow-400" />
                      <h3 className="text-xl font-black text-white">موقع المقهى</h3>
                      <p className="mt-3 max-w-md text-sm leading-7 text-zinc-400">{safeAddress}</p>
                      <p className="mt-3 text-sm text-zinc-500">أضف رابط Google Maps من إعدادات المقهى.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
