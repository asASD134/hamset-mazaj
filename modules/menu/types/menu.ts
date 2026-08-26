export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number | null;
  image: string;
  icon: string;
  featured: boolean;
}

export interface MenuCategory {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface MenuPresentationSettings {
  menu_title: string;
  menu_subtitle: string;
  menu_columns_desktop: 2 | 3 | 4;
  menu_card_style: "classic" | "minimal" | "luxury";
  menu_card_radius: "none" | "lg" | "xl" | "2xl";
  menu_card_shadow: boolean;
  menu_show_images: boolean;
  menu_show_descriptions: boolean;
  menu_show_prices: boolean;
  menu_show_featured_badge: boolean;
  menu_show_search: boolean;
  menu_category_style: "sections" | "tabs";
  menu_category_sticky: boolean;
  menu_section_spacing: "small" | "medium" | "large";
  menu_image_ratio: "square" | "landscape" | "portrait";
  menu_card_background: "surface" | "transparent";
  menu_card_border: boolean;
  menu_price_color: "accent" | "white" | "muted";
  menu_accent_color: string;
}
