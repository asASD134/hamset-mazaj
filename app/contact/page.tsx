import getCafeSettings from "@/lib/getCafeSettings";
import { getSocialLinks } from "@/services/socialLinks";
import {
  Mail,
  Phone,
  MapPin,
  Globe2,
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

  const activeLinks =
    socialLinks
      .filter(
        (link) => link.is_active
      )
      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black text-white"
    >
      <section className="px-6 py-14 text-center">
        <h1 className="mb-4 text-5xl font-bold text-yellow-400">
          📞 تواصل معنا
        </h1>

        <p className="text-gray-300">
          يسعدنا استقبالكم يوميًا في مقهى {cafeName}.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-2">

          {/* معلومات التواصل */}

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-8">

            <h2 className="mb-6 text-3xl font-bold text-yellow-400">
              معلومات التواصل
            </h2>

            <div className="space-y-5 text-lg">

              <p>
                📍 {address}
              </p>

              <p>
                🕒 {openingHours}
              </p>

              <a
                href={`tel:${phone}`}
                className="block text-yellow-400 transition hover:text-yellow-300"
              >
                📞 {phone}
              </a>

            </div>

            {/* جميع المواقع */}

            <div className="mt-8 flex flex-wrap gap-4">

              {activeLinks.map((link) => {
                const href =
                  normalizeLinkUrl(
                    link.url
                  );

                const favicon =
                  getFaviconUrl(
                    href
                  );

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
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-5 py-3 font-bold text-white transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
                  >
                    <span className="flex h-6 w-6 items-center justify-center">
                      {mail ? (
                        <Mail size={20} />
                      ) : phoneLink ? (
                        <Phone size={19} />
                      ) : favicon ? (
                        <img
                          src={favicon}
                          alt=""
                          className="h-5 w-5 rounded-full"
                        />
                      ) : (
                        <Globe2 size={20} />
                      )}
                    </span>

                    <span>
                      {link.name}
                    </span>
                  </a>
                );
              })}

            </div>
          </div>

          {/* الخريطة */}

          <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-900 p-8">

            <h2 className="mb-6 text-3xl font-bold text-yellow-400">
              📍 موقع المقهى
            </h2>

            <iframe
              title={`موقع ${cafeName}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                address
              )}&output=embed`}
              className="h-96 w-full rounded-2xl border-0"
              loading="lazy"
            />

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-2xl bg-yellow-400 px-6 py-3 text-center font-bold text-black transition hover:bg-yellow-300"
              >
                📍 فتح الموقع في Google Maps
              </a>
            )}

          </div>

        </div>
      </section>
    </main>
  );
}