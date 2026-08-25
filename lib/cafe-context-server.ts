import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_CAFE_SLUG = "hamset-mazaj";
const COOKIE_NAME = "active_cafe_context";
const REQUEST_CAFE_HEADER = "x-active-cafe-context";

export type ActiveCafe = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export async function getActiveCafeServer(): Promise<ActiveCafe | null> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const raw =
    headerStore.get(REQUEST_CAFE_HEADER) ||
    cookieStore.get(COOKIE_NAME)?.value ||
    DEFAULT_CAFE_SLUG;

  const supabase = await createClient();

  let query = supabase
    .from("cafes")
    .select("id,name,slug,is_active");

  if (/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(raw)) {
    query = query.eq("id", raw);
  } else {
    query = query.eq("slug", raw);
  }

  const { data } = await query.eq("is_active", true).maybeSingle();
  if (data) return data as ActiveCafe;

  const fallback = await supabase
    .from("cafes")
    .select("id,name,slug,is_active")
    .eq("slug", DEFAULT_CAFE_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  return (fallback.data as ActiveCafe | null) ?? null;
}
