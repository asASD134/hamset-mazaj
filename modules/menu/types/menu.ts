export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  icon: string;
  featured: boolean;
}

export interface MenuCategory {
  id: string;
  title: string;
  items: MenuItem[];
}