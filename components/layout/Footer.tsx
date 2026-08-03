"use client";

import Link from "next/link";
import {
  Coffee,
  Phone,
  MapPin,
  Camera,
  Clock3,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-yellow-500/20 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Coffee className="text-yellow-400" size={34} />

              <div>
                <h2 className="text-2xl font-black text-yellow-400">
                  همسة مزاج
                </h2>

                <p className="text-sm text-zinc-500">
                  Coffee & Lounge
                </p>
              </div>
            </div>

            <p className="leading-8 text-zinc-400">
              نقدم تجربة فاخرة تجمع بين القهوة المختصة،
              المشروبات، الحلويات، الشيشة والجلسات الراقية.
            </p>
          </div>

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

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              معلومات التواصل
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-3 text-zinc-400">
                <Phone className="text-yellow-400" size={20} />
                <span>05XXXXXXXX</span>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <MapPin className="text-yellow-400" size={20} />
                <span>المملكة العربية السعودية</span>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <Clock3 className="text-yellow-400" size={20} />
                <span>8:00 ص - 3:00 فجراً</span>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <Camera className="text-yellow-400" size={20} />
                <span>@hamset_mazaj</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              همسة مزاج
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
            © {year} همسة مزاج — جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}