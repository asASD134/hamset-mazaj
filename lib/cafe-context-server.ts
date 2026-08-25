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

function looksLikeUuid(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(value);
}

export async function getActiveCafeServer(): Promise<ActiveCafe | null> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const requested =
    headerStore.get(REQUEST_CAFE_HEADER) ||
    cookieStore.get(COOKIE_NAME)?.value ||
    DEFAULT_CAFE_SLUG;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSystemAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("is_system_admin");
    isSystemAdmin = Boolean(data);
  }

  let allowedCafeIds: string[] = [];

  if (user && !isSystemAdmin) {
    const { data: memberships } = await supabase
      .from("cafe_members")
      .select("cafe_id")
      .eq("user_id", user.id);

    allowedCafeIds = (memberships ?? []).map((row) => row.cafe_id as string);

    if (allowedCafeIds.length === 0) return null;

    // Normal cafe owners/managers may never inherit a cafe context
    // from another account, browser tab, cookie, or stale local storage.
    if (!allowedCafeIds.includes(requested)) {
      return getCafeById(supabase, allowedCafeIds[0]);
    }
  }

  if (looksLikeUuid(requested)) {
    return getCafeById(supabase, requested);
  }

  const { data } = await supabase
    .from("cafes")
    .select("id,name,slug,is_active")
    .eq("slug", requested)
    .eq("is_active", true)
    .maybeSingle();

  return (data as ActiveCafe | null) ?? null;
}

async function getCafeById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string
): Promise<ActiveCafe | null> {
  const { data } = await supabase
    .from("cafes")
    .select("id,name,slug,is_active")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  return (data as ActiveCafe | null) ?? null;
}
