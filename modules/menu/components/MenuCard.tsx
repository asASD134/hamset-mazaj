"use client";

import { ShoppingCart, Eye, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTable } from "@/context/TableContext";

type MenuItem = { id: string; name: string; description: string; price: number; calories?: number | null; image: string };
type MenuDesign = { cardRadius?: string; cardShadow?: boolean; showImages?: boolean; showDescriptions?: boolean; showPrices?: boolean; showFeaturedBadge?: boolean; imageRatio?: string; cardBackground?: string; cardBorder?: boolean; priceColor?: string; accentColor?: string };

const radius: Record<string,string> = { none:"rounded-none", lg:"rounded-2xl", xl:"rounded-[32px]", "2xl":"rounded-[40px]" };
const ratio: Record<string,string> = { square:"aspect-square", landscape:"aspect-[4/3]", portrait:"aspect-[3/4]" };

export default function MenuCard({ item, design }: { item: MenuItem; design?: MenuDesign }) {
  const { hasTable } = useTable(); const { addToCart } = useCart();
  const accent = design?.accentColor || "#EAB308";
  const radiusClass = radius[design?.cardRadius || "xl"] || radius.xl;
  const ratioClass = ratio[design?.imageRatio || "landscape"] || ratio.landscape;
  const cardBg = design?.cardBackground === "transparent" ? "bg-transparent" : "bg-gradient-to-b from-zinc-900 to-black";
  const border = design?.cardBorder === false ? "border-transparent" : "border-yellow-500/10";
  const shadow = design?.cardShadow === false ? "" : "shadow-2xl";
  const priceColor = design?.priceColor === "white" ? "text-white" : design?.priceColor === "muted" ? "text-zinc-300" : "text-yellow-400";

  return <article className={`group overflow-hidden border transition-all duration-500 hover:-translate-y-1 hover:border-yellow-500/40 ${radiusClass} ${cardBg} ${border} ${shadow}`}>
    {design?.showImages !== false && <div className={`relative overflow-hidden ${ratioClass}`}>
      {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full min-h-48 items-center justify-center bg-zinc-900 text-4xl">☕</div>}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      {design?.showPrices !== false && <div className="absolute right-5 top-5 rounded-full px-4 py-2 text-lg font-black text-black shadow-lg" style={{backgroundColor:accent}}>{item.price} ر.س</div>}
      {design?.showFeaturedBadge !== false && item.calories != null && <div className="absolute left-5 bottom-5 rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur">{item.calories} سعرة</div>}
    </div>}
    <div className="p-7">
      <div className="flex items-start justify-between gap-3"><h3 className="mb-4 text-3xl font-black text-white">{item.name}</h3>{item.featured && design?.showFeaturedBadge !== false && <Star size={18} fill="currentColor" className="mt-1 shrink-0 text-yellow-400" />}</div>
      {design?.showDescriptions !== false && <p className="min-h-[84px] leading-8 text-zinc-400">{item.description}</p>}
      {item.calories != null && <p className="mt-3 text-sm font-bold text-zinc-500">السعرات: {item.calories} سعرة حرارية</p>}
      {design?.showPrices !== false && <div className="mt-8 flex items-center justify-between"><div><p className="text-sm text-zinc-500">السعر</p><p className={`text-3xl font-black ${priceColor}`}>{item.price} ر.س</p></div>
        {hasTable ? <button onClick={() => addToCart({id:item.id,name:item.name,image:item.image,price:item.price,quantity:1})} className="flex items-center gap-3 rounded-2xl px-6 py-4 text-lg font-black text-black transition hover:scale-105 active:scale-95" style={{backgroundColor:accent}}><ShoppingCart size={22}/>إضافة للسلة</button> : <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-6 py-4 text-zinc-300"><Eye size={20}/>عرض فقط</div>}
      </div>}
    </div>
  </article>;
}
