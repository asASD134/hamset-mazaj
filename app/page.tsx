"use client";

import Hero from "@/components/home/Hero";
import ServiceQuickActions from "@/components/home/ServiceQuickActions";

import WhyChoose from "@/components/ui/WhyChoose";
import Gallery from "@/components/ui/Gallery";
import Reviews from "@/components/ui/Reviews";
import ContactInfo from "@/components/ui/ContactInfo";

import { useTable } from "@/context/TableContext";
import Link from "next/link";

export default function Home() {
  const { hasTable, tableNumber } = useTable();

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />

      {hasTable && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-3xl bg-yellow-500 p-8 text-center text-black shadow-2xl">
            <h2 className="text-4xl font-bold">
              مرحباً بك
            </h2>

            <p className="mt-3 text-xl">
              أنت على الطاولة رقم {tableNumber}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-5">
              <Link
                href={withTable("/menu")}
                className="min-w-[180px] rounded-2xl bg-black px-8 py-4 text-lg font-bold text-yellow-400 hover:bg-zinc-900 transition"
              >
                🍽️ اطلب الآن
              </Link>

              <Link
                href={withTable("/service")}
                className="min-w-[180px] rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black hover:bg-zinc-200 transition"
              >
                🛎️ الخدمات
              </Link>
            </div>
          </div>
        </section>
      )}

      {hasTable && <ServiceQuickActions />}

      <WhyChoose />
      <Gallery />
      <Reviews />
      <ContactInfo />
    </main>
  );
}