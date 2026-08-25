"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  CheckCircle2,
  Eye,
  KeyRound,
  LockKeyhole,
  Pencil,
  Play,
  Power,
  RotateCcw,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Cafe = {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string | null;
  is_active: boolean;
  created_at: string;
};

type Notice = {
  type: "success" | "error";
  text: string;
};

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [archiveCafe, setArchiveCafe] = useState<Cafe | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState("");
  const [archiveSaving, setArchiveSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cafes", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر تحميل المقاهي.");
      }

      setCafes(data.cafes ?? []);
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "تعذر تحميل المقاهي.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createCafe(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/cafes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          ownerEmail,
          ownerPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر إنشاء المقهى.");
      }

      setNotice({
        type: "success",
        text: "تم إنشاء المقهى وحساب المالك بنجاح.",
      });
      setName("");
      setSlug("");
      setOwnerEmail("");
      setOwnerPassword("");
      await load();
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "تعذر إنشاء المقهى.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function setActive(cafe: Cafe, nextActive: boolean) {
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/cafes/${cafe.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر تغيير حالة المقهى.");
      }

      setCafes((current) =>
        current.map((item) =>
          item.id === cafe.id
            ? { ...item, is_active: Boolean(data.cafe?.is_active) }
            : item
        )
      );

      setNotice({
        type: "success",
        text: nextActive ? "تم تشغيل المقهى." : "تم إيقاف المقهى مؤقتًا.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "تعذر تغيير الحالة.",
      });
    }
  }

  function openCredentials(cafe: Cafe) {
    setEditingCafe(cafe);
    setEditEmail("");
    setEditPassword("");
    setNotice(null);
  }

  async function saveCredentials(event: React.FormEvent) {
    event.preventDefault();
    if (!editingCafe) return;
    if (!editEmail.trim() && !editPassword) {
      setNotice({
        type: "error",
        text: "أدخل الإيميل الجديد أو كلمة السر الجديدة على الأقل.",
      });
      return;
    }

    setEditSaving(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/cafes/${editingCafe.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ownerEmail: editEmail.trim() || undefined,
          ownerPassword: editPassword || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر تحديث بيانات الدخول.");
      }

      setNotice({
        type: "success",
        text: "تم تحديث بيانات دخول المقهى بنجاح.",
      });
      setEditingCafe(null);
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "تعذر تحديث بيانات الدخول.",
      });
    } finally {
      setEditSaving(false);
    }
  }

  async function archiveSelectedCafe() {
    if (!archiveCafe) return;
    if (archiveConfirm.trim() !== archiveCafe.name) return;

    setArchiveSaving(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/cafes/${archiveCafe.id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmName: archiveConfirm.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر أرشفة المقهى.");
      }

      setCafes((current) =>
        current.map((item) =>
          item.id === archiveCafe.id
            ? { ...item, is_active: false }
            : item
        )
      );
      setArchiveCafe(null);
      setArchiveConfirm("");
      setNotice({
        type: "success",
        text: "تمت أرشفة المقهى بأمان، والبيانات لم تُحذف.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error ? error.message : "تعذر أرشفة المقهى.",
      });
    } finally {
      setArchiveSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-8" dir="rtl">
        <header className="rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-[#171207] via-[#0c0d12] to-[#07080b] p-7 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-300">
                <ShieldCheck size={15} />
                مدير النظام
              </div>
              <h1 className="text-4xl font-black text-yellow-400">
                إدارة المقاهي
              </h1>
              <p className="mt-2 max-w-3xl text-zinc-400">
                إنشاء وإدارة المقاهي المستقلة، التحكم في حالتها، وإدارة بيانات دخول ملاكها من مكان واحد.
              </p>
            </div>

            <Link
              href="/admin/settings"
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-yellow-500/40 hover:text-yellow-300"
            >
              إعدادات المنصة
            </Link>
          </div>
        </header>

        {notice && (
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${
              notice.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <X size={18} />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        <form
          onSubmit={createCafe}
          className="grid gap-4 rounded-[2rem] border border-yellow-500/20 bg-zinc-950 p-6 md:grid-cols-2"
        >
          <div className="md:col-span-2 mb-1 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
              <Store size={21} />
            </div>
            <div>
              <h2 className="font-black">إنشاء مقهى جديد</h2>
              <p className="text-xs text-zinc-600">
                الحساب والهوية والإعدادات الأساسية تُنشأ تلقائيًا.
              </p>
            </div>
          </div>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="اسم المقهى"
            required
            className="rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none transition focus:border-yellow-500/50"
          />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="الرابط: cafe-name"
            required
            className="rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none transition focus:border-yellow-500/50"
          />
          <input
            type="email"
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
            placeholder="بريد مالك المقهى"
            required
            className="rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none transition focus:border-yellow-500/50"
          />
          <input
            type="password"
            value={ownerPassword}
            onChange={(event) => setOwnerPassword(event.target.value)}
            placeholder="كلمة مرور المالك (8+ أحرف)"
            minLength={8}
            required
            className="rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none transition focus:border-yellow-500/50"
          />
          <button
            disabled={saving}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:bg-yellow-400 disabled:opacity-50 md:col-span-2"
          >
            {saving ? "جارٍ الإنشاء..." : "إنشاء مقهى جديد"}
          </button>
        </form>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">المقاهي الحالية</h2>
              <p className="mt-1 text-sm text-zinc-500">
                كل مقهى مستقل في بياناته وحساب مديره.
              </p>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-500 sm:block">
              {cafes.length} مقهى
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center text-zinc-500">
              جاري تحميل المقاهي...
            </div>
          ) : cafes.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center text-zinc-500">
              لا توجد مقاهي حاليًا.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {cafes.map((cafe) => (
                <article
                  key={cafe.id}
                  className={`rounded-[2rem] border bg-zinc-950 p-6 transition ${
                    cafe.is_active
                      ? "border-white/10 hover:border-yellow-500/30"
                      : "border-red-500/20 opacity-85"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-2xl font-black">
                          {cafe.name}
                        </h3>
                        {!cafe.is_active && (
                          <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-black text-red-300">
                            مؤرشف
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-zinc-500">
                        /{cafe.slug}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                        cafe.is_active
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {cafe.is_active ? "نشط" : "متوقف"}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => {
                        try {
                          window.localStorage.setItem(
                            "active_cafe_context",
                            cafe.id
                          );
                        } catch {}
                        window.location.assign(
                          `/admin?cafe=${encodeURIComponent(cafe.id)}`
                        );
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/30 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
                    >
                      <Store size={16} />
                      فتح اللوحة
                    </button>

                    <a
                      href={`/?cafe=${encodeURIComponent(cafe.slug)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-bold text-zinc-300 transition hover:border-blue-500/30 hover:text-blue-300"
                    >
                      <Eye size={16} />
                      معاينة الموقع
                    </a>

                    <button
                      onClick={() => void setActive(cafe, !cafe.is_active)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
                        cafe.is_active
                          ? "border-orange-500/20 text-orange-300 hover:bg-orange-500/10"
                          : "border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10"
                      }`}
                    >
                      {cafe.is_active ? (
                        <Power size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      {cafe.is_active ? "إيقاف المقهى" : "تشغيل المقهى"}
                    </button>

                    <button
                      onClick={() => openCredentials(cafe)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/20 py-3 text-sm font-bold text-violet-300 transition hover:bg-violet-500/10"
                    >
                      <KeyRound size={16} />
                      تغيير الدخول
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Link
                      href={`/admin/settings?cafe=${encodeURIComponent(cafe.id)}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-bold text-zinc-300 transition hover:border-white/20 hover:text-white"
                    >
                      <Pencil size={16} />
                      إعدادات المقهى
                    </Link>

                    <button
                      onClick={() => {
                        setArchiveCafe(cafe);
                        setArchiveConfirm("");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
                    >
                      <Archive size={16} />
                      أرشفة المقهى
                    </button>
                  </div>

                  <p className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
                    <UserRound size={14} />
                    حساب المالك: {cafe.owner_user_id ? "مرتبط" : "غير مرتبط"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {editingCafe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-violet-500/20 bg-[#0b0c10] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-300">
                  <LockKeyhole size={18} />
                  <span className="text-xs font-black">إدارة بيانات الدخول</span>
                </div>
                <h2 className="mt-2 text-2xl font-black">{editingCafe.name}</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  لا نطلب الإيميل أو كلمة السر القديمة. املأ فقط ما تريد تغييره.
                </p>
              </div>
              <button
                onClick={() => setEditingCafe(null)}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveCredentials} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  الإيميل الجديد
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  placeholder="اتركه فارغًا إذا لا تريد تغييره"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  كلمة السر الجديدة
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(event) => setEditPassword(event.target.value)}
                  placeholder="اتركها فارغة إذا لا تريد تغييرها"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 rounded-xl bg-violet-500 px-5 py-3 font-black text-white transition hover:bg-violet-400 disabled:opacity-50"
                >
                  {editSaving ? "جارٍ الحفظ..." : "حفظ بيانات الدخول"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCafe(null)}
                  className="rounded-xl border border-white/10 px-5 py-3 font-bold text-zinc-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {archiveCafe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-red-500/20 bg-[#0b0c10] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
                <Trash2 size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black">أرشفة المقهى</h2>
                <p className="mt-2 text-sm leading-7 text-zinc-500">
                  سيتم إيقاف المقهى وإخفاؤه من التشغيل العام، لكن بياناته ستبقى محفوظة ويمكن إعادة تشغيله لاحقًا.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-sm text-red-200">
              للتأكيد، اكتب اسم المقهى كاملًا:
              <div className="mt-2 font-black text-white">{archiveCafe.name}</div>
            </div>

            <input
              value={archiveConfirm}
              onChange={(event) => setArchiveConfirm(event.target.value)}
              placeholder="اكتب الاسم هنا"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-red-500/50"
            />

            <div className="mt-5 flex gap-3">
              <button
                disabled={
                  archiveSaving || archiveConfirm.trim() !== archiveCafe.name
                }
                onClick={() => void archiveSelectedCafe()}
                className="flex-1 rounded-xl bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {archiveSaving ? "جارٍ الأرشفة..." : "أرشفة المقهى"}
              </button>
              <button
                onClick={() => {
                  setArchiveCafe(null);
                  setArchiveConfirm("");
                }}
                className="rounded-xl border border-white/10 px-5 py-3 font-bold text-zinc-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
