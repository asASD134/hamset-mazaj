import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/services/platformSettings";

const DEFAULTS = {
  menu_title: "المنيو",
  menu_subtitle: "اختر ما يناسب ذوقك ثم أضفه إلى السلة.",
  menu_columns_desktop: 3,
  menu_card_style: "classic",
  menu_card_radius: "xl",
  menu_card_shadow: true,
  menu_show_images: true,
  menu_show_descriptions: true,
  menu_show_prices: true,
  menu_show_featured_badge: true,
  menu_show_search: false,
  menu_category_style: "sections",
  menu_category_sticky: false,
  menu_section_spacing: "large",
  menu_image_ratio: "landscape",
  menu_card_background: "surface",
  menu_card_border: true,
  menu_price_color: "accent",
  menu_accent_color: "#EAB308",
};

export async function GET() {
  const settings = await getPlatformSettings();
  return NextResponse.json({
    settings: {
      ...DEFAULTS,
      ...(settings.foundation || {}),
    },
  });
}
