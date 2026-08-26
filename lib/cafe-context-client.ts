import { supabase } from "@/lib/supabase-browser";

const DEFAULT_CAFE_SLUG = "hamset-mazaj";
const PLATFORM_TEMPLATE_SLUG = "__platform_template__";
const COOKIE_NAME = "active_cafe_context";
const STORAGE_KEY = "active_cafe_context";

function readStorage() {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function writeStorage(value: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, value); } catch {}
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

function getUrlCafeContext() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("cafe");
}

function getQueryParam(name: string) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function isAdminPath() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}

function isPlatformSettingsMode() {
  if (!isAdminPath()) return false;
  const explicitCafe = getUrlCafeContext();
  if (explicitCafe) return explicitCafe === PLATFORM_TEMPLATE_SLUG;
  return getQueryParam("platform") === "1";
}

function isPlatformPreviewMode() {
  if (typeof window === "undefined") return false;
  return getQueryParam("platformPreview") === "1";
}

async function getAllowedCafeIds() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, isSystemAdmin: false, cafeIds: [] as string[] };
  const { data: isSystemAdmin } = await supabase.rpc("is_system_admin");
  if (isSystemAdmin) return { userId: user.id, isSystemAdmin: true, cafeIds: [] as string[] };
  const { data: memberships, error } = await supabase.from("cafe_members").select("cafe_id").eq("user_id", user.id);
  if (error) throw error;
  return { userId: user.id, isSystemAdmin: false, cafeIds: (memberships ?? []).map((row) => row.cafe_id as string) };
}

function getRequestedContext() {
  const fromUrl = getUrlCafeContext();
  if (isAdminPath() && fromUrl) { writeStorage(fromUrl); return fromUrl; }
  if (isPlatformSettingsMode()) { writeStorage(PLATFORM_TEMPLATE_SLUG); return PLATFORM_TEMPLATE_SLUG; }
  if (isPlatformPreviewMode()) return PLATFORM_TEMPLATE_SLUG;
  if (isAdminPath()) {
    const activeCafe = readCookie(COOKIE_NAME) || readStorage();
    if (activeCafe && activeCafe !== PLATFORM_TEMPLATE_SLUG) return activeCafe;
    return DEFAULT_CAFE_SLUG;
  }
  return fromUrl === PLATFORM_TEMPLATE_SLUG ? DEFAULT_CAFE_SLUG : fromUrl || DEFAULT_CAFE_SLUG;
}

export async function getClientCafeId(): Promise<string> {
  const requested = getRequestedContext();
  const context = await getAllowedCafeIds();
  if (context.userId && !context.isSystemAdmin) {
    if (context.cafeIds.length === 0) throw new Error("لم يتم ربط هذا الحساب بأي مقهى.");
    if (!context.cafeIds.includes(requested)) return context.cafeIds[0];
  }
  if (/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(requested)) {
    const { data, error } = await supabase.from("cafes").select("id").eq("id", requested).eq("is_active", true).maybeSingle();
    if (error) throw error;
    if (data?.id) return data.id;
  }
  const { data, error } = await supabase.from("cafes").select("id").eq("slug", requested).eq("is_active", true).maybeSingle();
  if (error) throw error;
  if (data?.id) return data.id;
  throw new Error("لم يتم العثور على المقهى المحدد.");
}

export function getClientCafeContext() { return getRequestedContext(); }
export function isPlatformSettingsClientMode() { return isPlatformSettingsMode(); }
