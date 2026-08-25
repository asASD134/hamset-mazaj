import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getActiveCafeServer } from "@/lib/cafe-context-server";
import type { SiteControl } from "@/services/siteControl";

export const getSiteControl = cache(async (): Promise<SiteControl | null> => {
  const cafe = await getActiveCafeServer();
  if (!cafe) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_control").select("*").eq("cafe_id", cafe.id).maybeSingle();
  if (error) return null;
  return (data as SiteControl | null) ?? null;
});
