"use client";

import Link from "next/link";
import {
  Coffee,
  Phone,
  MapPin,
  Camera,
  Clock3,
} from "lucide-react";

import SiteName from "@/components/SiteName";
import { useCafeSettings } from "@/context/CafeSettingsContext";

export default function Footer() {
  const year = new Date().getFullYear();
  const { settings } = useCafeSettings();

  const phone = settings.phone || "0594165122";

  const address =
    settings.address ||
    "الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء";

  const openingHours =
    settings.opening_hours || "مفتوح 24 ساعة";

  const instagram =
    settings.instagram_handle || "hamsat.mazaaj";

  const snapchat =
    settings.snapchat_handle || "whisper_mood";

  return (
    <footer
      dir="rtl"
      className="border-t border-yellow-500/20 bg-black"
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* تعريف المقهى */}

          <div>
            <div className="mb-5 flex items-center gap-3">
              <Coffee
                className="text-yellow-400"
                size={34}
              />

              <div>
                <h2 className="text-2xl font-black text-yellow-400">
                  <SiteName />
                </h2>

                <p className="text-sm text-zinc-500">
                  Coffee & Lounge
                </p>
              </div>
            </div>

            <p className="leading-8 text-zinc-400">
              {settings.description ||
                "نقدم تجربة فاخرة تجمع بين القهوة المختصة، المشروبات، الحلويات، الشيشة والجلسات الراقية."}
            </p>
          </div>

          {/* الصفحات */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              الصفحات
            </h3>

            <div className="space-y-3">
              <Link
                href="/"
                className="block text-zinc-400 transition hover:text-yellow-400"
              >
                الرئيسية
              </Link>

              <Link
                href="/menu"
                className="block text-zinc-400 transition hover:text-yellow-400"
              >
                المنيو
              </Link>

              <Link
                href="/gallery"
                className="block text-zinc-400 transition hover:text-yellow-400"
              >
                المعرض
              </Link>

              <Link
                href="/matches"
                className="block text-zinc-400 transition hover:text-yellow-400"
              >
                المباريات
              </Link>

              <Link
                href="/contact"
                className="block text-zinc-400 transition hover:text-yellow-400"
              >
                تواصل معنا
              </Link>
            </div>
          </div>

          {/* معلومات التواصل */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              معلومات التواصل
            </h3>

            <div className="space-y-5">

              <div className="flex items-start gap-3 text-zinc-400">
                <Phone
                  className="mt-1 shrink-0 text-yellow-400"
                  size={20}
                />

                <a
                  href={`tel:${phone}`}
                  className="transition hover:text-yellow-400"
                >
                  {phone}
                </a>
              </div>

              <div className="flex items-start gap-3 text-zinc-400">
                <MapPin
                  className="mt-1 shrink-0 text-yellow-400"
                  size={20}
                />

                <span>{address}</span>
              </div>

              <div className="flex items-start gap-3 text-zinc-400">
                <Clock3
                  className="mt-1 shrink-0 text-yellow-400"
                  size={20}
                />

                <span>{openingHours}</span>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <Camera
                  className="text-yellow-400"
                  size={20}
                />

                <span>{instagram}</span>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <span className="text-yellow-400">
                  👻
                </span>

                <span>{snapchat}</span>
              </div>

            </div>
          </div>

          {/* الوصف */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              <SiteName />
            </h3>

            <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6">
              <p className="leading-8 text-zinc-400">
                جلسات داخلية وخارجية،
                خدمة سريعة،
                أفضل القهوة،
                الحلويات،
                المشروبات،
                نقل المباريات،
                وخدمة الطاولات عبر QR Code.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-14 border-t border-zinc-800 pt-8 text-center">
          <p className="text-zinc-500">
            © {year} <SiteName /> — جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}