"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  images: string[];
  cafeName: string;
};

export default function GalleryLightbox({ images, cafeName }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const previous = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, next, previous]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = activeIndex === null ? null : images[activeIndex];

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-900 text-right outline-none transition hover:border-yellow-400 focus-visible:ring-2 focus-visible:ring-yellow-400"
            aria-label={`فتح صورة ${index + 1}`}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={src}
                alt={`صورة ${index + 1} - معرض ${cafeName}`}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
            </div>
          </button>
        ))}
      </div>

      {activeImage && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="عارض صور المعرض"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="إغلاق"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              previous();
            }}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
            aria-label="الصورة السابقة"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
            aria-label="الصورة التالية"
          >
            <ChevronRight size={28} />
          </button>

          <div
            className="relative flex h-full w-full max-w-7xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage}
              alt={`صورة ${activeIndex + 1} - معرض ${cafeName}`}
              width={1800}
              height={1200}
              className="max-h-[88vh] w-auto max-w-full object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
