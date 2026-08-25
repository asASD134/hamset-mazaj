import Image from "next/image";
import getCafeSettings from "@/lib/getCafeSettings";
import { getSiteControl } from "@/services/siteControl";

const defaultImages = [
  "/images/gallery1.jpg",
  "/images/gallery2.jpg",
  "/images/gallery3.jpg",
  "/images/gallery4.jpg",
  "/images/gallery5.jpg",
  "/images/gallery6.jpg",
];

const defaultTitles = [
  "الجلسات الداخلية",
  "ركن القهوة",
  "أجواء هادئة",
  "جلسات الأصدقاء",
  "أفضل المشروبات",
  "أجواء المقهى",
];

export default async function GalleryPage() {
  const [cafeSettings, siteControl] =
    await Promise.all([
      getCafeSettings(),
      getSiteControl(),
    ]);

  const cafeName =
    cafeSettings.cafe_name || "همسة مزاج";

  /*
   * الصور الموجودة في النظام الحالي
   */
  const hasConfiguredImages =
    Array.isArray(siteControl?.gallery_images);

  const configuredImages =
    hasConfiguredImages
      ? siteControl.gallery_images
      : [];

  const configuredVisibility =
    Array.isArray(
      siteControl?.gallery_images_visible
    )
      ? siteControl.gallery_images_visible
      : [];

  /*
   * إذا كان هناك نظام صور محفوظ في الإعدادات:
   * نعرض كل الصور الموجودة فيه.
   *
   * لا نستخدم الصور القديمة مكان الصور المحذوفة.
   *
   * وإذا لم يكن هناك صور محفوظة أصلًا:
   * نستخدم الصور القديمة الافتراضية.
   */
  const sourceImages = hasConfiguredImages
    ? configuredImages
    : defaultImages;

  const images = sourceImages
    .map((src, index) => {
      if (!src) {
        return null;
      }

      const visible =
        hasConfiguredImages
          ? configuredVisibility[index] !== false
          : true;

      if (!visible) {
        return null;
      }

      return {
        src,
        index,
      };
    })
    .filter(
      (
        image
      ): image is {
        src: string;
        index: number;
      } => Boolean(image)
    );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black text-white"
    >
      {/* =========================================
          عنوان المعرض
      ========================================= */}

      <section className="px-6 py-14 text-center">
        <h1 className="mb-4 text-5xl font-bold text-yellow-400">
          📸 معرض {cafeName}
        </h1>

        <p className="mx-auto max-w-2xl text-gray-300">
          استمتع بجولة داخل مقهى {cafeName} وشاهد أجواء
          القهوة والجلسات الراقية التي تنتظرك.
        </p>
      </section>

      {/* =========================================
          جميع صور المعرض
      ========================================= */}

      <section className="mx-auto max-w-7xl px-6 pb-16">
        {images.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-12 text-center text-gray-400">
            لا توجد صور ظاهرة في المعرض حاليًا.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => {
              const title =
                defaultTitles[image.index] ||
                `صورة ${image.index + 1}`;

              return (
                <div
                  key={`${image.src}-${image.index}`}
                  className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-yellow-400"
                >
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={image.src}
                      alt={`${title} - ${cafeName}`}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-5">
                    <h2 className="mb-2 text-xl font-bold text-yellow-400">
                      {title}
                    </h2>

                    <p className="text-sm text-gray-400">
                      لحظات جميلة داخل مقهى {cafeName}.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}