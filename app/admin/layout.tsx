import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: isSystemAdmin } = await supabase.rpc("is_system_admin");
  const cookieStore = await cookies();
  const activeCafe = cookieStore.get("active_cafe_context")?.value ?? "";

  if (isSystemAdmin) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#050505] text-white">
        {children}
      </div>
    );
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("cafe_members")
    .select("cafe_id")
    .eq("user_id", user.id);

  const cafeIds = (memberships ?? []).map((row) => row.cafe_id as string);

  if (membershipError || cafeIds.length === 0) {
    redirect("/");
  }

  // A normal tenant account can only operate its own cafe.
  // Ignore any stale cookie/localStorage context from another account.
  if (!cafeIds.includes(activeCafe)) {
    redirect(`/admin?cafe=${encodeURIComponent(cafeIds[0])}`);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#050505] text-white">
      {children}
    </div>
  );
}
