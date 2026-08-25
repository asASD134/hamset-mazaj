"use client";

import {
  MapPin,
  Phone,
  Clock3,
  Camera,
  Map,
} from "lucide-react";

import { useCafeSettings } from "@/context/CafeSettingsContext";
import { useSiteControl } from "@/context/SiteControlContext";

export default function ContactSection() {
  const { settings } =
    useCafeSettings();

  const siteControl =
    useSiteControl();

  /*
   * إخفاء قسم التواصل كاملًا
   */
  if (
    siteControl?.contact_enabled === false
  ) {
    return null;
  }

  const address =
    settings.address ||
    "الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء";

  const phone =
    settings.phone ||
    "0594165122";

  const openingHours =
    settings.opening_hours ||
    "مفتوح 24 ساعة";

  const instagram =
    settings.instagram_handle ||
    "hamsat.mazaaj";

  const whatsapp =
    settings.whatsapp ||
    "https://wa.me/966594165122";

  const mapsUrl =
    settings.maps_url || "";

  const showTitle =
    siteControl?.show_contact_title !==
    false;

  const showDescription =
    siteControl?.show_contact_description !==
    false;

  const showAddress =
    siteControl?.show_contact_address !==
    false;

  const showPhone =
    siteControl?.show_contact_phone !==
    false;

  const showHours =
    siteControl?.show_contact_hours !==
    false;

  const showMap =
    siteControl?.show_contact_map !==
    false;

  const showSocial =
    siteControl?.show_contact_social_links !==
    false;

  const title =
    siteControl?.contact_title ||
    "يسعدنا استقبالكم";

  const description =
    siteControl?.contact_description ||
    "زورونا واستمتعوا بأفضل تجربة قهوة وجلسات راقية.";

  return (
    <section
      dir="rtl"
      className="bg-[#0d0d0d] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* =========================================
            رأس القسم
        ========================================= */}

        {(showTitle ||
          showDescription) && (
          <div className="mb-16 text-center">

            {showTitle && (
              <>
                <span className="font-bold tracking-widest text-yellow-400">
                  تواصل معنا
                </span>

                <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
                  {title}
                </h2>
              </>
            )}

            {showDescription && (
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
                {description}
              </p>
            )}

          </div>
        )}

        <div
          className={
            showMap
              ? "grid gap-8 lg:grid-cols-2"
              : "mx-auto max-w-3xl"
          }
        >

          {/* =========================================
              معلومات التواصل
          ========================================= */}

          <div className="space-y-6">

            {/* الموقع */}
            {showAddress && (
              <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

                <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                  <MapPin size={24} />
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    الموقع
                  </h3>

                  <p className="leading-7 text-zinc-400">
                    {address}
                  </p>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 font-bold text-yellow-400 transition hover:text-yellow-300"
                    >
                      <Map size={18} />
                      فتح الموقع
                    </a>
                  )}
                </div>

              </div>
            )}

            {/* الهاتف */}
            {showPhone && (
              <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

                <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                  <Phone size={24} />
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    الهاتف
                  </h3>

                  <a
                    href={`tel:${phone}`}
                    className="text-zinc-400 transition hover:text-yellow-400"
                  >
                    {phone}
                  </a>

                  {whatsapp && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block font-bold text-green-400 transition hover:text-green-300"
                    >
                      💬 واتساب
                    </a>
                  )}
                </div>

              </div>
            )}

            {/* أوقات العمل */}
            {showHours && (
              <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

                <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                  <Clock3 size={24} />
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    أوقات العمل
                  </h3>

                  <p className="text-zinc-400">
                    {openingHours}
                  </p>
                </div>

              </div>
            )}

            {/* Instagram / Social */}
            {showSocial && (
              <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

                <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                  <Camera size={24} />
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    إنستغرام
                  </h3>

                  <p className="text-zinc-400">
                    {instagram}
                  </p>
                </div>

              </div>
            )}

          </div>

          {/* =========================================
              الخريطة
          ========================================= */}

          {showMap && (
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">

              {mapsUrl ? (
                <iframe
                  title="Google Map"
                  src={`${mapsUrl}${
                    mapsUrl.includes("?")
                      ? "&output=embed"
                      : "?output=embed"
                  }`}
                  className="h-full min-h-[500px] w-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex min-h-[500px] items-center justify-center p-8 text-center">

                  <div>
                    <MapPin
                      size={48}
                      className="mx-auto mb-5 text-yellow-400"
                    />

                    <h3 className="mb-3 text-2xl font-bold text-white">
                      موقع المقهى
                    </h3>

                    <p className="mb-6 leading-8 text-zinc-400">
                      {address}
                    </p>

                    <p className="text-zinc-500">
                      أضف رابط Google Maps من إعدادات المقهى.
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </section>
  );
}