export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;

  category: string;

  name: string;

  description: string;

  price: number;

  image: string;

  available: boolean;

  featured: boolean;

  sort_order: number;
}

export interface ProductFormData {
  categoryId: string;

  nameAr: string;
  nameEn: string;

  descriptionAr: string;
  descriptionEn: string;

  price: string;
  calories: string;

  image: File | null;
}