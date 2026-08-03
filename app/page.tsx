"use client";

import Link from "next/link";

import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChoose from "@/components/home/WhyChoose";
import GalleryPreview from "@/components/home/GalleryPreview";
import Testimonials from "@/components/home/Testimonials";
import ContactSection from "@/components/home/ContactSection";
import ServiceQuickActions from "@/components/home/ServiceQuickActions";

import { useTable } from "@/context/TableContext";

export default function Home() {
  const { hasTable, tableNumber } = useTable();

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  return (
    <main className="bg-black text-white">
      <Hero />

      {hasTable && (
        <section className="bg-[#111111] py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500 to-yellow-600 p-10 text-center text-black shadow-2xl">
              <h2 className="text-4xl font-black">
                أهلاً بك 👋
              </h2>

              <p className="mt-4 text-xl font-semibold">
                أنت الآن على الطاولة رقم {tableNumber}
              </p>

              <p className="mx-auto mt-3 max-w-2xl text-base text-black/80">
                يمكنك الآن تصفح المنيو، إرسال الطلبات، أو استخدام خدمات
                الطاولة مباشرة.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-5">
                <Link
                  href={withTable("/menu")}
                  className="rounded-2xl bg-black px-8 py-4 text-lg font-bold text-yellow-400 transition-all duration-300 hover:scale-105"
                >
                  🍽️ اطلب الآن
                </Link>

                <Link
                  href={withTable("/service")}
                  className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black transition-all duration-300 hover:scale-105"
                >
                  🛎️ خدمات الطاولة
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasTable && <ServiceQuickActions />}

      <FeaturedProducts />

      <WhyChoose />

      <GalleryPreview />

      <Testimonials />

      <ContactSection />
    </main>
  );
}