import Image from "next/image";
import getCafeSettings from "@/lib/getCafeSettings";

const images = [
  {
    src: "/images/gallery1.jpg",
    title: "الجلسات الداخلية",
  },
  {
    src: "/images/gallery2.jpg",
    title: "ركن القهوة",
  },
  {
    src: "/images/gallery3.jpg",
    title: "أجواء هادئة",
  },
  {
    src: "/images/gallery4.jpg",
    title: "جلسات الأصدقاء",
  },
  {
    src: "/images/gallery5.jpg",
    title: "أفضل المشروبات",
  },
  {
    src: "/images/gallery6.jpg",
    title: "أجواء المقهى",
  },
];

export default async function GalleryPage() {
  const settings = await getCafeSettings();

  const cafeName =
    settings.cafe_name || "همسة مزاج";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black text-white"
    >
      <section className="px-6 py-14 text-center">
        <h1 className="mb-4 text-5xl font-bold text-yellow-400">
          📸 معرض {cafeName}
        </h1>

        <p className="mx-auto max-w-2xl text-gray-300">
          استمتع بجولة داخل مقهى {cafeName} وشاهد أجواء
          القهوة والجلسات الراقية التي تنتظرك.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.src}
              className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-yellow-400"
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={image.src}
                  alt={`${image.title} - ${cafeName}`}
                  fill
                  className="object-cover transition duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              <div className="p-5">
                <h2 className="mb-2 text-xl font-bold text-yellow-400">
                  {image.title}
                </h2>

                <p className="text-sm text-gray-400">
                  لحظات جميلة داخل مقهى {cafeName}.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}