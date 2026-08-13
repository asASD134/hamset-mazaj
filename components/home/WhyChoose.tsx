"use client";

import {
  Coffee,
  Wifi,
  Tv,
  Users,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import SiteName from "@/components/SiteName";

const features = [
  {
    icon: Coffee,
    title: "قهوة مختصة",
    desc: "أفضل أنواع البن المحضر باحترافية عالية.",
  },
  {
    icon: Sparkles,
    title: "شيشة فاخرة",
    desc: "نكهات متنوعة وجودة عالية وتجهيز احترافي.",
  },
  {
    icon: Tv,
    title: "نقل المباريات",
    desc: "مشاهدة جميع المباريات المحلية والعالمية.",
  },
  {
    icon: Wifi,
    title: "واي فاي مجاني",
    desc: "اتصال سريع ومجاني لجميع الزوار.",
  },
  {
    icon: Users,
    title: "جلسات راقية",
    desc: "جلسات داخلية وخارجية مريحة لجميع الأوقات.",
  },
  {
    icon: ShieldCheck,
    title: "خدمة مميزة",
    desc: "سرعة في تقديم الطلبات واهتمام بأدق التفاصيل.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="font-bold tracking-[0.3em] text-yellow-400">
            لماذا نحن؟
          </span>

          <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
            لماذا تختار <SiteName />؟
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            نقدم تجربة متكاملة تجمع بين جودة المنتجات، راحة الجلسات،
            وسرعة الخدمة في أجواء راقية تناسب جميع الأوقات.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500 text-black transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon size={30} />
                </div>

                <h3 className="mb-3 text-2xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="min-h-[72px] leading-8 text-zinc-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}