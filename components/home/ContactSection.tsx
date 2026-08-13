"use client";

import {
  MapPin,
  Phone,
  Clock3,
  Camera,
  Map,
} from "lucide-react";

import { useCafeSettings } from "@/context/CafeSettingsContext";

export default function ContactSection() {
  const { settings } = useCafeSettings();

  const address =
    settings.address ||
    "الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء";

  const phone =
    settings.phone || "0594165122";

  const openingHours =
    settings.opening_hours || "مفتوح 24 ساعة";

  const instagram =
    settings.instagram_handle || "hamsat.mazaaj";

  const whatsapp =
    settings.whatsapp || "https://wa.me/966594165122";

  const mapsUrl =
    settings.maps_url || "";

  return (
    <section
      dir="rtl"
      className="bg-[#0d0d0d] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="font-bold tracking-widest text-yellow-400">
            تواصل معنا
          </span>

          <h2 className="mt-3 text-4xl font-black text-white">
            يسعدنا استقبالكم
          </h2>

          <p className="mt-4 text-zinc-400">
            زورونا واستمتعوا بأفضل تجربة قهوة وجلسات راقية.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">

            {/* الموقع */}

            <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                <MapPin size={24} />
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  الموقع
                </h3>

                <p className="text-zinc-400">
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

            {/* الهاتف */}

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

                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block font-bold text-green-400 transition hover:text-green-300"
                >
                  💬 واتساب
                </a>
              </div>
            </div>

            {/* أوقات العمل */}

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

            {/* Instagram */}

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
          </div>

          {/* الخريطة */}

          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            {mapsUrl ? (
              <iframe
                title="Google Map"
                src={`${mapsUrl}${
                  mapsUrl.includes("?")
                    ? "&output=embed"
                    : "?output=embed"
                }`}
                className="h-full min-h-[500px] w-full"
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

                  <p className="mb-6 text-zinc-400">
                    {address}
                  </p>

                  <p className="text-zinc-500">
                    أضف رابط Google Maps من إعدادات المقهى.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}