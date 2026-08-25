"use client";

import { useEffect } from "react";
import Link from "next/link";

import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChoose from "@/components/home/WhyChoose";
import GalleryPreview from "@/components/home/GalleryPreview";
import Testimonials from "@/components/home/Testimonials";
import ContactSection from "@/components/home/ContactSection";
import MatchesPreview from "@/components/home/MatchesPreview";
import ServiceQuickActions from "@/components/home/ServiceQuickActions";

import { useTable } from "@/context/TableContext";
import { useSiteControl } from "@/context/SiteControlContext";

export default function Home() {
  const { hasTable, tableNumber } = useTable();
  const siteControl = useSiteControl();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // The admin cafe picker stores the currently selected cafe here.
    // When the preview link opens the homepage without a query string,
    // carry that selected cafe into the public route so previewing from
    // a cafe's settings always shows that cafe rather than the default cafe.
    if (!searchParams.get("cafe")) {
      const activeCafe = window.localStorage.getItem("active_cafe_context");

      if (activeCafe) {
        window.location.replace(
          `/?cafe=${encodeURIComponent(activeCafe)}`
        );
      }
    }
  }, []);

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  return (
    <main dir="rtl" className="bg-black text-white">
      {/* =========================================
          Hero
      ========================================= */}
      <Hero />

      {siteControl?.matches_enabled !== false && <MatchesPreview />}

      {/* =========================================
          ترحيب الطاولة
      ========================================= */}
      {hasTable && (
        <section className="bg-[#111111] py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-center text-black shadow-2xl md:p-10">
              <h2 className="text-3xl font-black md:text-4xl">أهلاً بك 👋</h2>

              <p className="mt-4 text-lg font-semibold md:text-xl">
                أنت الآن على الطاولة رقم {" "}
                {tableNumber}
              </p>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-black/80 md:text-base">
                يمكنك الآن تصفح المنيو، إرسال الطلبات،
                أو استخدام خدمات الطاولة مباشرة.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href={withTable("/menu")}
                  className="rounded-2xl bg-black px-7 py-3.5 text-base font-bold text-yellow-400 transition hover:scale-105 md:px-8 md:py-4 md:text-lg"
                >
                  🍽️ اطلب الآن
                </Link>

                <Link
                  href={withTable("/service")}
                  className="rounded-2xl bg-white px-7 py-3.5 text-base font-bold text-black transition hover:scale-105 md:px-8 md:py-4 md:text-lg"
                >
                  🛎️ خدمات الطاولة
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          خدمات الطاولة
      ========================================= */}
      {hasTable && <ServiceQuickActions />}

      {/* =========================================
          المنتجات المميزة
      ========================================= */}
      {siteControl?.featured_enabled !== false && <FeaturedProducts />}

      {/* =========================================
          لماذا نحن
      ========================================= */}
      {siteControl?.why_enabled !== false && <WhyChoose />}

      {/* =========================================
          المعرض
      ========================================= */}
      {siteControl?.gallery_enabled !== false && <GalleryPreview />}

      {/* =========================================
          آراء العملاء
      ========================================= */}
      {siteControl?.testimonials_enabled !== false && <Testimonials />}

      {/* =========================================
          التواصل
      ========================================= */}
      {siteControl?.contact_enabled !== false && <ContactSection />}
    </main>
  );
}
