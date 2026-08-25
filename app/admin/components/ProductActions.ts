import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";
import { ProductFormData } from "./types";

const BUCKET = "menu-images";

export async function uploadProductImage(
  image: File | null
) {
  if (!image) {
    return "";
  }

  const extension =
    image.name.split(".").pop() || "png";

  const fileName =
    `${crypto.randomUUID()}.${extension}`;

  const filePath =
    `products/${fileName}`;

  const { error } =
    await supabase.storage
      .from(BUCKET)
      .upload(filePath, image, {
        upsert: false,
      });

  if (error) {
    throw new Error(error.message);
  }

  const { data } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createProduct(
  form: ProductFormData
) {
  if (!form.categoryId) {
    throw new Error(
      "يجب اختيار التصنيف"
    );
  }

  if (!form.nameAr.trim()) {
    throw new Error(
      "اسم المنتج مطلوب"
    );
  }

  const cafeId = await getClientCafeId();

  const imageUrl =
    await uploadProductImage(
      form.image
    );

  const { error } =
    await supabase
      .from("menu")
      .insert({
        cafe_id: cafeId,
        category_id: form.categoryId,
        name_ar: form.nameAr.trim(),
        name_en:
          form.nameEn.trim() ||
          form.nameAr.trim(),
        description_ar:
          form.descriptionAr.trim(),
        description_en:
          form.descriptionEn.trim(),
        price: Number(form.price),
        calories:
          Number(form.calories) || 0,
        image_url:
          imageUrl || null,
        is_available: true,
        is_featured: false,
        sort_order: 0,
      });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProduct(
  id: string | number,
  form: ProductFormData,
  currentImage: string | null
) {
  if (!form.categoryId) {
    throw new Error(
      "يجب اختيار التصنيف"
    );
  }

  if (!form.nameAr.trim()) {
    throw new Error(
      "اسم المنتج مطلوب"
    );
  }

  const cafeId = await getClientCafeId();

  let imageUrl =
    currentImage ?? null;

  if (form.image) {
    imageUrl =
      await uploadProductImage(
        form.image
      );
  }

  const { error } =
    await supabase
      .from("menu")
      .update({
        category_id: form.categoryId,
        name_ar: form.nameAr.trim(),
        name_en:
          form.nameEn.trim() ||
          form.nameAr.trim(),
        description_ar:
          form.descriptionAr.trim(),
        description_en:
          form.descriptionEn.trim(),
        price: Number(form.price),
        calories:
          Number(form.calories) || 0,
        image_url: imageUrl,
      })
      .eq("id", id)
      .eq("cafe_id", cafeId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(
  id: string | number
) {
  const cafeId = await getClientCafeId();

  const confirmed =
    window.confirm(
      "هل أنت متأكد من حذف هذا المنتج؟"
    );

  if (!confirmed) {
    return;
  }

  const { error } =
    await supabase
      .from("menu")
      .delete()
      .eq("id", id)
      .eq("cafe_id", cafeId);

  if (error) {
    throw new Error(error.message);
  }
}