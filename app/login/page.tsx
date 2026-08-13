"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

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

    console.log("LOGIN RESULT", {
      hasSession: !!data?.session,
      userId: data?.session?.user?.id ?? null,
      error: error
        ? {
            message: error.message,
            code: error.code,
          }
        : null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data?.session) {
      setError("فشل تسجيل الدخول: لم يتم إنشاء الجلسة.");
      return;
    }

    // Verify session is persisted in the browser client before redirecting
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      console.log("LOGIN SESSION AFTER", {
        hasSession: !!sessionData?.session,
        userId: sessionData?.session?.user?.id ?? null,
      });

      if (!sessionData?.session) {
        setError("فشل تسجيل الدخول: الجلسة غير موجودة بعد المصادقة.");
        return;
      }
    } catch (err: any) {
      console.error("GET SESSION AFTER LOGIN ERROR", err);
      setError("فشل التحقق من الجلسة بعد تسجيل الدخول.");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-yellow-500/20 bg-zinc-900 p-8 space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">
          تسجيل الدخول
        </h1>

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
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-black hover:bg-yellow-400 transition"
        >
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}