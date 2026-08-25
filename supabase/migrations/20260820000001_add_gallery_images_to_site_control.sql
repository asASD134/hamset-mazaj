"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useTable } from "@/context/TableContext";
import SiteName from "@/components/SiteName";
import { useSiteControl } from "@/context/SiteControlContext";

const defaultImages = [
  "/images/gallery1.jpg",
  "/images/gallery2.jpg",
  "/images/gallery3.jpg",
  "/images/gallery4.jpg",
  "/images/gallery5.jpg",
  "/images/gallery6.jpg",
];

export default function GalleryPreview() {
  const { hasTable, tableNumber } = useTable();
  const siteControl = useSiteControl();

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  if (siteControl?.gallery_enabled === false) {
    return null;
  }

  const showTitle = siteControl?.show_gallery_title !== false;
  const showDescription =
    siteControl?.show_gallery_description !== false;
  const showImages = siteControl?.show_gallery_images !== false;
  const showButton = siteControl?.show_gallery_button !== false;

  const title = siteControl?.gallery_title || "أجواء همسة مزاج";

  const description =
    siteControl?.gallery_description ||
    "شاهد مجموعة من الصور التي تعكس أجواء المقهى والجلسات الراقية.";

  const hasConfiguredGallery = Array.isArray(
    siteControl?.gallery_images
  );

  const configuredImages = hasConfiguredGallery
    ? siteControl.gallery_images
    : [];

  const configuredVisibility = Array.isArray(
    siteControl?.gallery_images_visible
  )
    ? siteControl.gallery_images_visible
    : [];

  const images = Array.from({ length: 6 }, (_, index) => {
    /*
     * إذا كان النظام القديم لا يحتوي على gallery_images
     * نستخدم الصور القديمة كصور افتراضية.
     *
     * أما إذا كان gallery_images موجودًا:
     * الخانة الفارغة تعني أن الصورة محذوفة،
     * ولذلك لا نرجع الصورة القديمة مكانها.
     */
    const image = hasConfiguredGallery
      ? configuredImages[index] || ""
      : defaultImages[index];

    const visible =
      configuredVisibility.length > 0
        ? configuredVisibility[index] !== false
        : true;

    return {
      image,
      index,
      visible,
    };
  }).filter((item) => item.visible && Boolean(item.image));

  return (
    <section dir="rtl" className="bg-[#0b0b0b] py-24">
      <div className="mx-auto max-w-7xl px-6">
        {(showTitle || showDescription) && (
          <div className="mb-14 text-center">
            {showTitle && (
              <>
                <span className="font-bold tracking-[0.3em] text-yellow-400">
                  معرض الصور
                </span>

                <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
                  {title}
                </h2>
              </>
            )}

            {showDescription && (
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
                {description}
              </p>
            )}
          </div>
        )}

        {showImages && (
          <>
            {images.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {images.map(({ image, index }) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative h-80 overflow-hidden rounded-3xl border border-zinc-800"
                  >
                    <Image
                      src={image}
                      alt={`صورة ${index + 1} من معرض ${title}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    <div className="absolute inset-0 bg-black/20 transition-all duration-300 group-hover:bg-black/45" />

                    <div className="absolute inset-0 flex items-end justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <span className="mb-6 rounded-full bg-yellow-500 px-5 py-2 font-bold text-black">
                        <SiteName />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#121212] p-10 text-center text-zinc-500">
                لا توجد صور ظاهرة في المعرض حاليًا.
              </div>
            )}
          </>
        )}

        {showButton && (
          <div className="mt-16 text-center">
            <Link
              href={withTable("/gallery")}
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-yellow-500 px-8 py-4 text-lg font-bold text-yellow-400 transition-all duration-300 hover:bg-yellow-500 hover:text-black"
            >
              عرض جميع الصور
              <ArrowLeft size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}