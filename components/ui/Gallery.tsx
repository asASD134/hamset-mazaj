"use client";

import SiteName from "@/components/SiteName";
import { useCafeSettings } from "@/context/CafeSettingsContext";

export default function Gallery() {
  const { settings } = useCafeSettings();

  const cafeName = settings.cafe_name || "همسة مزاج";

  return (
    <section className="py-16 bg-black px-6">
      <h2 className="text-4xl text-yellow-400 font-bold text-center mb-10">
        معرض <SiteName />
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <img
          src="/images/gallery1.jpg"
          alt={`معرض ${cafeName}`}
          className="rounded-2xl w-full h-64 object-cover"
        />

        <img
          src="/images/gallery2.jpg"
          alt={`معرض ${cafeName}`}
          className="rounded-2xl w-full h-64 object-cover"
        />

        <img
          src="/images/gallery3.jpg"
          alt={`معرض ${cafeName}`}
          className="rounded-2xl w-full h-64 object-cover"
        />

        <img
          src="/images/gallery4.jpg"
          alt={`معرض ${cafeName}`}
          className="rounded-2xl w-full h-64 object-cover"
        />

        <img
          src="/images/gallery5.jpg"
          alt={`معرض ${cafeName}`}
          className="rounded-2xl w-full h-64 object-cover"
        />

        <img
          src="/images/gallery6.jpg"
          alt={`معرض ${cafeName}`}
          className="rounded-2xl w-full h-64 object-cover"
        />
      </div>
    </section>
  );
}