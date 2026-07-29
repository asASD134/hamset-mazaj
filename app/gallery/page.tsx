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
    title: "همسة مزاج",
  },
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* عنوان الصفحة */}
      <section className="py-14 text-center">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">
          📸 معرض همسة مزاج
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto">
          استمتع بجولة داخل مقهى همسة مزاج وشاهد أجواء القهوة والجلسات
          الراقية التي تنتظرك.
        </p>
      </section>

      {/* الصور */}
      <section className="max-w-7xl mx-auto px-6 pb-16">

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {images.map((image, index) => (

            <div
              key={index}
              className="bg-zinc-900 rounded-3xl overflow-hidden border border-yellow-500/20 hover:border-yellow-400 transition duration-300 hover:-translate-y-2"
            >

              <img
                src={image.src}
                alt={image.title}
                className="w-full h-72 object-cover"
              />

              <div className="p-5">

                <h2 className="text-xl font-bold text-yellow-400 mb-2">
                  {image.title}
                </h2>

                <p className="text-gray-400 text-sm">
                  لحظات جميلة داخل مقهى همسة مزاج.
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}