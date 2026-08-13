export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string | number;

  name_ar: string;
  name_en: string;

  description_ar: string;
  description_en: string;

  price: number;
  calories: number;

  image_url: string | null;

  is_available: boolean;
  is_featured: boolean;

  sort_order: number;
  created_at?: string;
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