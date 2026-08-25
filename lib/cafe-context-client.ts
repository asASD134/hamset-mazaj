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

function getUrlCafeContext() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("cafe");
}

function isAdminPath() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}

async function getAllowedCafeIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      isSystemAdmin: false,
      cafeIds: [] as string[],
    };
  }

  const { data: isSystemAdmin } = await supabase.rpc("is_system_admin");

  if (isSystemAdmin) {
    return {
      userId: user.id,
      isSystemAdmin: true,
      cafeIds: [] as string[],
    };
  }

  const { data: memberships, error } = await supabase
    .from("cafe_members")
    .select("cafe_id")
    .eq("user_id", user.id);

  if (error) throw error;

  return {
    userId: user.id,
    isSystemAdmin: false,
    cafeIds: (memberships ?? []).map((row) => row.cafe_id as string),
  };
}

function getRequestedContext() {
  const fromUrl = getUrlCafeContext();

  // Admin pages may remember the selected cafe for navigation between admin
  // screens. Public pages must never inherit the admin's last selected cafe.
  if (isAdminPath()) {
    if (fromUrl) {
      try {
        window.localStorage.setItem(STORAGE_KEY, fromUrl);
      } catch {}
      return fromUrl;
    }

    return readStorage() || readCookie(COOKIE_NAME) || DEFAULT_CAFE_SLUG;
  }

  // On the public site, the cafe is determined by the URL. This prevents one
  // cafe's admin context from leaking into another cafe in the same browser.
  return fromUrl || DEFAULT_CAFE_SLUG;
}

export async function getClientCafeId(): Promise<string> {
  const requested = getRequestedContext();
  const context = await getAllowedCafeIds();

  if (context.userId && !context.isSystemAdmin) {
    if (context.cafeIds.length === 0) {
      throw new Error("لم يتم ربط هذا الحساب بأي مقهى.");
    }

    if (!context.cafeIds.includes(requested)) {
      return context.cafeIds[0];
    }
  }

  if (/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(requested)) {
    const { data, error } = await supabase
      .from("cafes")
      .select("id")
      .eq("id", requested)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (data?.id) return data.id;
  }

  const { data, error } = await supabase
    .from("cafes")
    .select("id")
    .eq("slug", requested)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (data?.id) return data.id;

  throw new Error("لم يتم العثور على المقهى المحدد.");
}

export function getClientCafeContext() {
  return getRequestedContext();
}
