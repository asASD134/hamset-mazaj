"use client";

import {
  MapPin,
  Phone,
  Clock3,
  Camera,
} from "lucide-react";

export default function ContactSection() {
  return (
    <section className="bg-[#0d0d0d] py-24">
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
            <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                <MapPin size={24} />
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  الموقع
                </h3>

                <p className="text-zinc-400">
                  المملكة العربية السعودية
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                <Phone size={24} />
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  الهاتف
                </h3>

                <p className="text-zinc-400">
                  05XXXXXXXX
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                <Clock3 size={24} />
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  أوقات العمل
                </h3>

                <p className="text-zinc-400">
                  يومياً من 8:00 صباحاً حتى 3:00 فجراً
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="rounded-2xl bg-yellow-500 p-4 text-black">
                <Camera size={24} />
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  إنستغرام
                </h3>

                <p className="text-zinc-400">
                  @hamset_mazaj
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-800">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps?q=Saudi+Arabia&output=embed"
              className="h-full min-h-[500px] w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}