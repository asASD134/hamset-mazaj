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

    const { data, error } =
      await supabase.auth.signInWithPassword({
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
      setError(
        "فشل تسجيل الدخول: لم يتم إنشاء الجلسة."
      );
      return;
    }

    const {
      data: sessionData,
    } = await supabase.auth.getSession();

    if (!sessionData?.session) {
      setLoading(false);
      setError(
        "فشل التحقق من الجلسة بعد تسجيل الدخول."
      );
      return;
    }

    // استخدم انتقالًا كاملًا للصفحة حتى يتم حفظ
    // جلسة Supabase قبل وصول طلب /admin إلى Middleware.
    window.location.assign("/admin");
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
        <h1 className="text-center text-3xl font-bold">
          تسجيل الدخول
        </h1>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full rounded-lg bg-zinc-800 p-3 outline-none"
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full rounded-lg bg-zinc-800 p-3 outline-none"
          required
        />

        {error && (
          <div className="text-center text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "جارٍ تسجيل الدخول..."
            : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}