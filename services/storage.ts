import { supabase } from "@/lib/supabase";

const BUCKET = "menu-images";

export async function uploadMenuImage(file: File) {
  const extension = file.name.split(".").pop() || "png";

  const fileName = `${crypto.randomUUID()}.${extension}`;

  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteMenuImage(url: string) {
  const index = url.indexOf("products/");

  if (index === -1) return;

  const filePath = url.substring(index);

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath]);

  if (error) {
    throw error;
  }
}