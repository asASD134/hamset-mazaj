"use client";

import { Star } from "lucide-react";
import SiteName from "@/components/SiteName";

const reviews = [
  {
    name: "محمد",
    text: "أفضل مقهى زرته، القهوة ممتازة والخدمة سريعة جداً.",
  },
  {
    name: "عبدالله",
    text: "جلسات مريحة وشاشات كبيرة لمتابعة المباريات، تجربة رائعة.",
  },
  {
    name: "أحمد",
    text: "الشيشة ممتازة والموظفون محترمون، سأكرر الزيارة بالتأكيد.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="font-bold tracking-[0.3em] text-yellow-400">
            آراء العملاء
          </span>

          <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
            ماذا يقول عملاؤنا؟
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            نفخر بثقة عملائنا ونسعى دائماً لتقديم أفضل تجربة داخل
            مقهى <SiteName />.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10"
            >
              <div className="mb-6 flex gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={20}
                    fill="currentColor"
                  />
                ))}
              </div>

              <p className="min-h-[110px] leading-8 text-zinc-300">
                &quot;{review.text}&quot;
              </p>

              <div className="mt-8 border-t border-zinc-700 pt-5">
                <h3 className="text-lg font-bold text-white">
                  {review.name}
                </h3>

                <span className="text-sm font-medium text-yellow-400">
                  عميل مميز
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}