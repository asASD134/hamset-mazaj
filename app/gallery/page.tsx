import getCafeSettings from "@/lib/getCafeSettings";
import { getActiveCafeServer } from "@/lib/cafe-context-server";
import { createClient } from "@/lib/supabase/server";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ cafe?: string }>;
}) {
  const params = await searchParams;
  const requestedCafe = params.cafe || null;

  const [cafeSettings, activeCafe] = await Promise.all([
    getCafeSettings(requestedCafe),
    getActiveCafeServer(requestedCafe),
  ]);

  const cafeName = cafeSettings?.cafe_name || "همسة مزاج";

  let images: string[] = [];

  if (activeCafe) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_control")
      .select("gallery_images")
      .eq("cafe_id", activeCafe.id)
      .maybeSingle();

    images = Array.isArray(data?.gallery_images)
      ? data.gallery_images.filter(
          (src): src is string =>
            typeof src === "string" && src.length > 0
        )
      : [];
  }

  return (
    <main dir="rtl" className="min-h-screen bg-black text-white">
      <section className="px-6 py-14 text-center">
        <h1 className="text-5xl font-bold text-yellow-400">
          📸 معرض {cafeName}
        </h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        {images.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900 p-12 text-center text-gray-400">
            لا توجد صور في المعرض حاليًا.
          </div>
        ) : (
          <GalleryLightbox images={images} cafeName={cafeName} />
        )}
      </section>
    </main>
  );
}
