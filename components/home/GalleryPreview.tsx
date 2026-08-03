"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTable } from "@/context/TableContext";

const images = [
  "/images/gallery1.jpg",
  "/images/gallery2.jpg",
  "/images/gallery3.jpg",
  "/images/gallery4.jpg",
  "/images/gallery5.jpg",
  "/images/gallery6.jpg",
];

export default function GalleryPreview() {
  const { hasTable, tableNumber } = useTable();

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  return (
    <section className="bg-[#0b0b0b] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <span className="font-bold tracking-[0.3em] text-yellow-400">
            معرض الصور
          </span>

          <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
            أجواء همسة مزاج
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            شاهد مجموعة من الصور التي تعكس أجواء المقهى والجلسات الراقية.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative h-80 overflow-hidden rounded-3xl border border-zinc-800"
            >
              <Image
                src={image}
                alt={`صورة ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/20 transition-all duration-300 group-hover:bg-black/45" />

              <div className="absolute inset-0 flex items-end justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span className="mb-6 rounded-full bg-yellow-500 px-5 py-2 font-bold text-black">
                  همسة مزاج
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href={withTable("/gallery")}
            className="inline-flex items-center gap-3 rounded-2xl border-2 border-yellow-500 px-8 py-4 text-lg font-bold text-yellow-400 transition-all duration-300 hover:bg-yellow-500 hover:text-black"
          >
            عرض جميع الصور
            <ArrowLeft size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}