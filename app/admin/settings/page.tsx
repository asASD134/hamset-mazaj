"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";

import {
  getCafeSettings,
  updateCafeSettings,
} from "@/services/cafeSettings";

import {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  toggleSocialLink,
  type SocialLink,
} from "@/services/socialLinks";

function getSocialIcon(
  name: string,
  url: string
) {
  const value =
    `${name} ${url}`.toLowerCase();

  if (
    value.includes("instagram")
  ) {
    return "📸";
  }

  if (
    value.includes("facebook") ||
    value.includes("fb.com")
  ) {
    return "📘";
  }

  if (
    value.includes("youtube") ||
    value.includes("youtu.be")
  ) {
    return "▶️";
  }

  if (
    value.includes("tiktok")
  ) {
    return "🎵";
  }

  if (
    value.includes("snapchat")
  ) {
    return "👻";
  }

  if (
    value.includes("whatsapp") ||
    value.includes("wa.me")
  ) {
    return "💬";
  }

  if (
    value.includes("telegram") ||
    value.includes("t.me")
  ) {
    return "✈️";
  }

  if (
    value.includes("twitter") ||
    value.includes("x.com")
  ) {
    return "𝕏";
  }

  if (
    value.includes("discord")
  ) {
    return "🎮";
  }

  if (
    value.includes("linkedin")
  ) {
    return "💼";
  }

  if (
    value.includes("email") ||
    value.includes("mailto:")
  ) {
    return "✉️";
  }

  if (
    value.includes("google") ||
    value.includes("maps.app") ||
    value.includes("google.com/maps")
  ) {
    return "📍";
  }

  return "🔗";
}

function getFaviconUrl(url: string) {
  try {
    const parsed = new URL(url);

    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      parsed.hostname
    )}&sz=64`;
  } catch {
    return null;
  }
}

function normalizeSocialUrl(
  value: string
) {
  const clean = value.trim();

  if (!clean) return "";

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("mailto:") ||
    clean.startsWith("tel:")
  ) {
    return clean;
  }

  return `https://${clean}`;
}

export default function AdminSettingsPage() {
  const [cafeName, setCafeName] =
    useState("همسة مزاج");

  const [logoUrl, setLogoUrl] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [openingHours, setOpeningHours] =
    useState("مفتوح 24 ساعة");

  const [description, setDescription] =
    useState("");

  const [socialLinks, setSocialLinks] =
    useState<SocialLink[]>([]);

  const [newSocialName, setNewSocialName] =
    useState("");

  const [newSocialUrl, setNewSocialUrl] =
    useState("");

  const [editingSocialId, setEditingSocialId] =
    useState<string | null>(null);

  const [editingSocialName, setEditingSocialName] =
    useState("");

  const [editingSocialUrl, setEditingSocialUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [socialLoading, setSocialLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [socialMessage, setSocialMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const [row, links] =
          await Promise.all([
            getCafeSettings(),
            getSocialLinks(),
          ]);

        if (!mounted) return;

        if (row) {
          setCafeName(
            row.cafe_name ||
              "همسة مزاج"
          );

          setLogoUrl(
            row.logo_url || ""
          );

          setPhone(
            row.phone || ""
          );

          setAddress(
            row.address || ""
          );

          setOpeningHours(
            row.opening_hours ||
              "مفتوح 24 ساعة"
          );

          setDescription(
            row.description || ""
          );
        }

        setSocialLinks(links);
      } catch (error) {
        console.error(error);

        if (mounted) {
          setMessage(
            "حدث خطأ أثناء تحميل إعدادات المقهى."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveCafeSettings() {
    setSaving(true);
    setMessage("");

    try {
      await updateCafeSettings({
        cafe_name:
          cafeName.trim() ||
          "همسة مزاج",

        logo_url:
          logoUrl.trim() || null,

        phone:
          phone.trim() || null,

        address:
          address.trim() || null,

        opening_hours:
          openingHours.trim() ||
          "مفتوح 24 ساعة",

        description:
          description.trim() || null,
      });

      setMessage(
        "تم حفظ إعدادات المقهى بنجاح."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "حدث خطأ أثناء حفظ إعدادات المقهى."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSocialLink() {
    const name =
      newSocialName.trim();

    const url =
      normalizeSocialUrl(
        newSocialUrl
      );

    if (!name) {
      setSocialMessage(
        "اكتب اسم الموقع."
      );
      return;
    }

    if (!url) {
      setSocialMessage(
        "اكتب رابط الموقع."
      );
      return;
    }

    setSocialLoading(true);
    setSocialMessage("");

    try {
      const created =
        await createSocialLink({
          name,
          url,
          icon: getSocialIcon(
            name,
            url
          ),
          sort_order:
            socialLinks.length * 10,
        });

      setSocialLinks((current) =>
        [...current, created].sort(
          (a, b) =>
            a.sort_order -
            b.sort_order
        )
      );

      setNewSocialName("");
      setNewSocialUrl("");

      setSocialMessage(
        "تمت إضافة الموقع بنجاح."
      );
    } catch (error) {
      console.error(error);

      setSocialMessage(
        "حدث خطأ أثناء إضافة الموقع."
      );
    } finally {
      setSocialLoading(false);
    }
  }

  function startEditingSocial(
    link: SocialLink
  ) {
    setEditingSocialId(link.id);

    setEditingSocialName(
      link.name
    );

    setEditingSocialUrl(
      link.url
    );

    setSocialMessage("");
  }

  function cancelEditingSocial() {
    setEditingSocialId(null);
    setEditingSocialName("");
    setEditingSocialUrl("");
  }

  async function handleUpdateSocialLink() {
    if (!editingSocialId) return;

    const name =
      editingSocialName.trim();

    const url =
      normalizeSocialUrl(
        editingSocialUrl
      );

    if (!name) {
      setSocialMessage(
        "اكتب اسم الموقع."
      );
      return;
    }

    if (!url) {
      setSocialMessage(
        "اكتب رابط الموقع."
      );
      return;
    }

    setSocialLoading(true);
    setSocialMessage("");

    try {
      const updated =
        await updateSocialLink(
          editingSocialId,
          {
            name,
            url,
            icon: getSocialIcon(
              name,
              url
            ),
          }
        );

      setSocialLinks((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      cancelEditingSocial();

      setSocialMessage(
        "تم تحديث الموقع بنجاح."
      );
    } catch (error) {
      console.error(error);

      setSocialMessage(
        "حدث خطأ أثناء تحديث الموقع."
      );
    } finally {
      setSocialLoading(false);
    }
  }

  async function handleDeleteSocialLink(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "هل أنت متأكد من حذف هذا الموقع؟"
      );

    if (!confirmed) return;

    setSocialLoading(true);
    setSocialMessage("");

    try {
      await deleteSocialLink(id);

      setSocialLinks((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      if (
        editingSocialId === id
      ) {
        cancelEditingSocial();
      }

      setSocialMessage(
        "تم حذف الموقع بنجاح."
      );
    } catch (error) {
      console.error(error);

      setSocialMessage(
        "حدث خطأ أثناء حذف الموقع."
      );
    } finally {
      setSocialLoading(false);
    }
  }

  async function handleToggleSocialLink(
    link: SocialLink
  ) {
    setSocialLoading(true);
    setSocialMessage("");

    try {
      const updated =
        await toggleSocialLink(
          link.id,
          !link.is_active
        );

      setSocialLinks((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );
    } catch (error) {
      console.error(error);

      setSocialMessage(
        "حدث خطأ أثناء تغيير حالة الموقع."
      );
    } finally {
      setSocialLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        dir="rtl"
        className="p-8 text-white"
      >
        جارٍ تحميل إعدادات المقهى...
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0b0b0b] text-white"
    >
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-yellow-400">
            ⚙️ إعدادات المقهى
          </h1>

          <p className="mt-2 text-zinc-400">
            الاسم والشعار وبيانات المقهى ومواقع التواصل من مكان واحد.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6 md:p-8">

          {/* بيانات المقهى */}

          <div>
            <label className="mb-2 block font-bold">
              اسم المقهى
            </label>

            <input
              value={cafeName}
              onChange={(e) =>
                setCafeName(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
              placeholder="همسة مزاج"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold">
              رابط الشعار
            </label>

            <input
              value={logoUrl}
              onChange={(e) =>
                setLogoUrl(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
              placeholder="/images/logo.png"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-bold">
                الهاتف
              </label>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
                placeholder="0594165122"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">
                أوقات العمل
              </label>

              <input
                value={openingHours}
                onChange={(e) =>
                  setOpeningHours(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
                placeholder="مفتوح 24 ساعة"
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block font-bold">
              العنوان
            </label>

            <input
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
              placeholder="الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold">
              الوصف العام
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={5}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
              placeholder="وصف المقهى..."
            />
          </div>

          {message && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-yellow-400">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={
              handleSaveCafeSettings
            }
            disabled={saving}
            className="w-full rounded-xl bg-yellow-500 px-6 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "جارٍ حفظ إعدادات المقهى..."
              : "حفظ إعدادات المقهى"}
          </button>

          {/* مواقع التواصل */}

          <div className="border-t border-zinc-800 pt-8">

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-2xl font-black text-yellow-400">
                  🌐 مواقع التواصل
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                  جميع المواقع هنا تعمل بنفس النظام ويمكنك إضافة أي موقع جديد.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">
                {socialLinks.length} موقع
              </div>

            </div>

            {/* إضافة موقع */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-yellow-500 p-3 text-black">
                  <Plus size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    إضافة موقع جديد
                  </h3>

                  <p className="text-sm text-zinc-500">
                    اكتب اسم الموقع والرابط فقط، وسيتم اختيار الأيقونة تلقائيًا.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    اسم الموقع
                  </label>

                  <input
                    value={newSocialName}
                    onChange={(e) =>
                      setNewSocialName(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                    placeholder="YouTube"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    الرابط
                  </label>

                  <input
                    value={newSocialUrl}
                    onChange={(e) =>
                      setNewSocialUrl(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleAddSocialLink
                }
                disabled={
                  socialLoading
                }
                className="mt-4 w-full rounded-xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {socialLoading
                  ? "جارٍ الإضافة..."
                  : "➕ إضافة الموقع"}
              </button>

            </div>

            {socialMessage && (
              <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-yellow-400">
                {socialMessage}
              </div>
            )}

            {/* قائمة المواقع */}

            <div className="mt-6 space-y-4">

              {socialLinks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center">
                  <LinkIcon
                    size={34}
                    className="mx-auto mb-3 text-zinc-600"
                  />

                  <p className="font-bold text-zinc-300">
                    لا توجد مواقع مضافة.
                  </p>
                </div>
              ) : (
                socialLinks
                  .slice()
                  .sort(
                    (a, b) =>
                      a.sort_order -
                      b.sort_order
                  )
                  .map((link) => {

                    const editing =
                      editingSocialId ===
                      link.id;

                    const icon =
                      getSocialIcon(
                        link.name,
                        link.url
                      );

                    const favicon =
                      getFaviconUrl(
                        link.url
                      );

                    return (
                      <div
                        key={link.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                      >

                        {editing ? (
                          <div className="space-y-4">

                            <div className="grid gap-4 md:grid-cols-2">

                              <div>
                                <label className="mb-2 block text-sm font-bold">
                                  اسم الموقع
                                </label>

                                <input
                                  value={
                                    editingSocialName
                                  }
                                  onChange={(e) =>
                                    setEditingSocialName(
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-bold">
                                  الرابط
                                </label>

                                <input
                                  value={
                                    editingSocialUrl
                                  }
                                  onChange={(e) =>
                                    setEditingSocialUrl(
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                                />
                              </div>

                            </div>

                            <div className="flex flex-wrap gap-3">

                              <button
                                type="button"
                                onClick={
                                  handleUpdateSocialLink
                                }
                                disabled={
                                  socialLoading
                                }
                                className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-60"
                              >
                                حفظ التعديل
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditingSocial
                                }
                                className="rounded-xl border border-zinc-700 px-5 py-3 font-bold text-zinc-300 transition hover:bg-zinc-800"
                              >
                                إلغاء
                              </button>

                            </div>

                          </div>
                        ) : (
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex min-w-0 items-center gap-4">

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white">

                                {favicon ? (
                                  <img
                                    src={favicon}
                                    alt=""
                                    className="h-8 w-8 rounded"
                                  />
                                ) : (
                                  <span className="text-2xl">
                                    {icon}
                                  </span>
                                )}

                              </div>

                              <div className="min-w-0">

                                <h3 className="font-bold text-white">
                                  {link.name}
                                </h3>

                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 block max-w-[500px] truncate text-sm text-zinc-500 transition hover:text-yellow-400"
                                >
                                  {link.url}
                                </a>

                                <div className="mt-2">
                                  <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                                      link.is_active
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-zinc-800 text-zinc-500"
                                    }`}
                                  >
                                    {link.is_active
                                      ? "ظاهر في الموقع"
                                      : "مخفي عن الموقع"}
                                  </span>
                                </div>

                              </div>

                            </div>

                            <div className="flex flex-wrap gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleSocialLink(
                                    link
                                  )
                                }
                                disabled={
                                  socialLoading
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-bold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-60"
                              >
                                {link.is_active ? (
                                  <>
                                    <EyeOff size={18} />
                                    إخفاء
                                  </>
                                ) : (
                                  <>
                                    <Eye size={18} />
                                    إظهار
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  startEditingSocial(
                                    link
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 px-4 py-3 font-bold text-blue-400 transition hover:bg-blue-500/10"
                              >
                                <Pencil size={18} />
                                تعديل
                              </button>

                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-bold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-400"
                              >
                                <ExternalLink size={18} />
                                فتح
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteSocialLink(
                                    link.id
                                  )
                                }
                                disabled={
                                  socialLoading
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-3 font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                              >
                                <Trash2 size={18} />
                                حذف
                              </button>

                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}