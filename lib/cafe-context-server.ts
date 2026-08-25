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

export async function getActiveCafeServer(
  requestedOverride?: string | null,
  options?: { includeInactive?: boolean }
): Promise<ActiveCafe | null> {
  const includeInactive = options?.includeInactive === true;
  const headerStore = await headers();
  const cookieStore = await cookies();
  const requested =
    requestedOverride ||
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

    if (!allowedCafeIds.includes(requested)) {
      return getCafeById(supabase, allowedCafeIds[0], includeInactive);
    }
  }

  if (looksLikeUuid(requested)) {
    return getCafeById(supabase, requested, includeInactive);
  }

  let query = supabase
    .from("cafes")
    .select("id,name,slug,is_active")
    .eq("slug", requested)
    .maybeSingle();

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data } = await query;
  return (data as ActiveCafe | null) ?? null;
}

async function getCafeById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  includeInactive = false
): Promise<ActiveCafe | null> {
  let query = supabase
    .from("cafes")
    .select("id,name,slug,is_active")
    .eq("id", id)
    .maybeSingle();

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data } = await query;
  return (data as ActiveCafe | null) ?? null;
}
