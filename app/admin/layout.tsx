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

  // غير مسجل الدخول
  if (userError || !user) {
    redirect("/login");
  }

  const { data: isSystemAdmin } = await supabase.rpc("is_system_admin");
  const { data: cafeIds } = await supabase.rpc("current_cafe_ids");
  const cookieStore = await cookies();
  const activeCafe = cookieStore.get("active_cafe_context")?.value;
  const isCafeMember = (cafeIds ?? []).length > 0;

  if (!isSystemAdmin && !isCafeMember) {
    redirect("/");
  }

  if (!isSystemAdmin && (cafeIds ?? []).length === 1 && activeCafe !== cafeIds?.[0]) {
    redirect(`/admin?cafe=${cafeIds?.[0]}`);
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#050505] text-white"
    >
      {children}
    </div>
  );
}