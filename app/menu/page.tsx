"use client";

import { useEffect, useMemo, useState } from "react";
import { useTable } from "@/context/TableContext";
import SectionTitle from "@/components/ui/SectionTitle";
import MenuCard from "@/modules/menu/components/MenuCard";
import { getMenuCategories, type MenuCategory } from "@/modules/menu";
import { useCafeSettings } from "@/context/CafeSettingsContext";

const defaults = {
  menu_title: "المنيو",
  menu_subtitle: "اختر ما يناسب ذوقك ثم أضفه إلى السلة.",
  menu_columns_desktop: 3,
  menu_card_radius: "xl",
  menu_card_shadow: true,
  menu_show_images: true,
  menu_show_descriptions: true,
  menu_show_prices: true,
  menu_show_featured_badge: true,
  menu_show_search: false,
  menu_category_sticky: false,
  menu_section_spacing: "large",
  menu_image_ratio: "landscape",
  menu_card_background: "surface",
  menu_card_border: true,
  menu_price_color: "accent",
  menu_price_position: "right",
  menu_accent_color: "#EAB308",
};

type Design = typeof defaults;
const columns: Record<number, string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 xl:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" };
const spacing: Record<string, string> = { small: "mb-12", medium: "mb-18", large: "mb-24" };

export default function MenuPage() {
  const { hasTable, tableNumber } = useTable();
  const { settings } = useCafeSettings();
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [design, setDesign] = useState<Design>(defaults);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMenuCategories(),
      fetch("/api/public/platform-menu-settings", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ settings: {} })),
    ]).then(([menu, visual]) => {
      setMenuCategories(menu);
      setDesign({ ...defaults, ...(visual?.settings || {}) });
    }).finally(() => setLoading(false));
  }, []);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menuCategories;
    return menuCategories.map((category) => ({ ...category, items: category.items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(q)) })).filter((category) => category.items.length > 0);
  }, [menuCategories, query]);

  const cafeName = settings.cafe_name || "همسة مزاج";
  const gridClass = columns[Number(design.menu_columns_desktop)] || columns[3];
  const sectionClass = spacing[String(design.menu_section_spacing)] || spacing.large;
  const heroAccent = String(design.menu_accent_color || "#EAB308");

  return (
    <main dir="rtl" className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-yellow-500/20 bg-gradient-to-b from-[#181818] via-[#111111] to-black py-24" style={{ borderColor: `${heroAccent}33` }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle_at_top, ${heroAccent}14, transparent 60%)` }} />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          {hasTable && <div className="mx-auto mb-10 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-8 py-4"><span className="text-lg font-bold text-yellow-400">🍽️ الطلب للطاولة رقم {tableNumber}</span></div>}
          <h1 className="text-5xl font-black text-white md:text-6xl">{String(design.menu_title)} {design.menu_title === "المنيو" ? cafeName : ""}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-zinc-400">{String(design.menu_subtitle)}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle title={String(design.menu_title)} subtitle={String(design.menu_subtitle)} />
          {design.menu_show_search && <div className="mx-auto mb-12 max-w-2xl"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في المنيو..." className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 text-white outline-none focus:border-yellow-500" /></div>}

          {loading ? <div className="py-32 text-center"><div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" /><p className="text-zinc-400">جاري تحميل قائمة الطعام...</p></div> : filteredCategories.map((category) => (
            <section key={category.id} className={sectionClass}>
              <div className={`mb-10 flex items-center gap-5 ${design.menu_category_sticky ? "sticky top-0 z-10 bg-black/90 py-4 backdrop-blur" : ""}`}>
                <div className="h-12 w-2 rounded-full" style={{ backgroundColor: heroAccent }} />
                <div><h2 className="text-4xl font-black" style={{ color: heroAccent }}>{category.title}</h2><div className="mt-2 h-[2px] w-24 rounded-full" style={{ backgroundColor: `${heroAccent}66` }} /></div>
              </div>
              <div className={`grid gap-8 ${gridClass}`}>
                {category.items.map((item) => <MenuCard key={item.id} item={item} design={{ cardRadius: String(design.menu_card_radius), cardShadow: Boolean(design.menu_card_shadow), showImages: Boolean(design.menu_show_images), showDescriptions: Boolean(design.menu_show_descriptions), showPrices: Boolean(design.menu_show_prices), showFeaturedBadge: Boolean(design.menu_show_featured_badge), imageRatio: String(design.menu_image_ratio), cardBackground: String(design.menu_card_background), cardBorder: Boolean(design.menu_card_border), priceColor: String(design.menu_price_color), pricePosition: String(design.menu_price_position), accentColor: heroAccent }} />)}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
