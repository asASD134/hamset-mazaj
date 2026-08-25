"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    if (!data?.session) {
      setLoading(false);
      setError("فشل تسجيل الدخول: لم يتم إنشاء الجلسة.");
      return;
    }

    const { data: isSystemAdmin } = await supabase.rpc("is_system_admin");

    if (isSystemAdmin) {
      window.location.assign("/admin?cafe=hamset-mazaj");
      return;
    }

    const { data: memberships, error: membershipError } = await supabase
      .from("cafe_members")
      .select("cafe_id")
      .eq("user_id", data.user.id);

    if (membershipError) {
      setLoading(false);
      setError("تعذر تحديد المقهى المرتبط بهذا الحساب.");
      return;
    }

    const cafeIds = (memberships ?? []).map((row) => row.cafe_id as string);

    if (cafeIds.length === 0) {
      setLoading(false);
      setError("هذا الحساب غير مرتبط بأي مقهى.");
      return;
    }

    // Full navigation saves the Supabase session before the admin route loads.
    window.location.assign(
      `/admin?cafe=${encodeURIComponent(cafeIds[0])}`
    );
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-black px-4 text-white"
    >
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl border border-yellow-500/20 bg-zinc-900 p-8"
      >
        <h1 className="text-center text-3xl font-bold">تسجيل الدخول</h1>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-zinc-800 p-3 outline-none"
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-zinc-800 p-3 outline-none"
          required
        />

        {error && (
          <div className="text-center text-sm text-red-500">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}
