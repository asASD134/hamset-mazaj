import { supabase } from "@/lib/supabase";
import { ProductFormData } from "./types";

export async function uploadProductImage(image: File | null) {
  if (!image) return "";

  const extension = image.name.split(".").pop() || "png";
  const fileName = `${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("menu")
    .upload(fileName, image);

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("menu")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function createProduct(form: ProductFormData) {
  const imageUrl = await uploadProductImage(form.image);

  const { error } = await supabase.from("menu").insert({
    category_id: Number(form.categoryId),
    name_ar: form.nameAr,
    name_en: form.nameEn,
    description_ar: form.descriptionAr,
    description_en: form.descriptionEn,
    price: Number(form.price),
    calories: Number(form.calories),
    image_url: imageUrl,
    is_available: true,
    is_featured: false,
    sort_order: 1,
  });

  if (error) throw new Error(error.message);
}

export async function updateProduct(
  id: number,
  form: ProductFormData,
  currentImage: string
) {
  let imageUrl = currentImage;

  if (form.image) {
    imageUrl = await uploadProductImage(form.image);
  }

  const { error } = await supabase
    .from("menu")
    .update({
      category_id: Number(form.categoryId),
      name_ar: form.nameAr,
      name_en: form.nameEn,
      description_ar: form.descriptionAr,
      description_en: form.descriptionEn,
      price: Number(form.price),
      calories: Number(form.calories),
      image_url: imageUrl,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: number) {
  const confirmed = confirm("هل أنت متأكد من حذف هذا المنتج؟");

  if (!confirmed) return;

  const { error } = await supabase
    .from("menu")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}