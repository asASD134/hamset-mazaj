export interface Category {
  id: number;
  name_ar: string;
}

export interface MenuItem {
  id: number;
  category_id: number;

  name_ar: string;
  name_en: string;

  description_ar: string;
  description_en: string;

  price: number;
  calories: number;

  image_url: string;

  is_available: boolean;
  is_featured: boolean;

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