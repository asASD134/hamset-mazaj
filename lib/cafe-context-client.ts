import { supabase } from "@/lib/supabase-browser";

const DEFAULT_CAFE_SLUG = "hamset-mazaj";
const COOKIE_NAME = "active_cafe_context";
const STORAGE_KEY = "active_cafe_context";

function readStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

function looksLikeUuid(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(value);
}

function getUrlCafeContext() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("cafe");
}

function isAdminPath() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}

export async function getClientCafeId(): Promise<string> {
  const fromUrl = getUrlCafeContext();
  const context =
    fromUrl ||
    (isAdminPath() ? readStorage() || readCookie(COOKIE_NAME) : null) ||
    DEFAULT_CAFE_SLUG;

  if (looksLikeUuid(context)) return context;

  const { data, error } = await supabase
    .from("cafes")
    .select("id")
    .eq("slug", context)
    .eq("is_active", true)
    .single();

  if (error || !data?.id) {
    if (context !== DEFAULT_CAFE_SLUG) {
      const fallback = await supabase
        .from("cafes")
        .select("id")
        .eq("slug", DEFAULT_CAFE_SLUG)
        .eq("is_active", true)
        .single();
      if (fallback.data?.id) return fallback.data.id;
    }
    throw new Error("لم يتم العثور على المقهى المحدد.");
  }

  return data.id;
}

export function getClientCafeContext() {
  const fromUrl = getUrlCafeContext();
  if (fromUrl) return fromUrl;

  if (isAdminPath()) {
    return readStorage() || readCookie(COOKIE_NAME) || DEFAULT_CAFE_SLUG;
  }

  return DEFAULT_CAFE_SLUG;
}
