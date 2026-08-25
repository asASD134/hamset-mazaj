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
  Store,
  Home,
  Globe2,
  Star,
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

import HomeSettingsPanel from "@/components/admin/settings/HomeSettingsPanel";

type Tab = "cafe" | "home" | "social";

function getSocialIcon(name: string, url: string) {
  const value = `${name} ${url}`.toLowerCase();

  if (value.includes("instagram")) return "📸";
  if (value.includes("facebook") || value.includes("fb.com")) return "📘";
  if (value.includes("youtube") || value.includes("youtu.be")) return "▶️";
  if (value.includes("tiktok")) return "🎵";
  if (value.includes("snapchat")) return "👻";
  if (value.includes("whatsapp") || value.includes("wa.me")) return "💬";
  if (value.includes("telegram") || value.includes("t.me")) return "✈️";
  if (value.includes("twitter") || value.includes("x.com")) return "𝕏";
  if (value.includes("discord")) return "🎮";
  if (value.includes("linkedin")) return "💼";
  if (value.includes("email") || value.includes("mailto:")) return "✉️";
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

function normalizeSocialUrl(value: string) {
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
  const [activeTab, setActiveTab] = useState<Tab>("cafe");

  const [cafeName, setCafeName] = useState("همسة مزاج");
  const [logoUrl, setLogoUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("مفتوح 24 ساعة");
  const [description, setDescription] = useState("");

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newSocialName, setNewSocialName] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [editingSocialName, setEditingSocialName] = useState("");
  const [editingSocialUrl, setEditingSocialUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [socialMessage, setSocialMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const [row, links] = await Promise.all([
          getCafeSettings(),
          getSocialLinks(),
        ]);

        if (!mounted) return;

        if (row) {
          setCafeName(row.cafe_name || "همسة مزاج");
          setLogoUrl(row.logo_url || "");
          setPhone(row.phone || "");
          setAddress(row.address || "");
          setOpeningHours(row.opening_hours || "مفتوح 24 ساعة");
          setDescription(row.description || "");
        }

        setSocialLinks(links);
      } catch (error) {
        console.error(error);
        if (mounted) {
          setMessage("حدث خطأ أثناء تحميل الإعدادات.");
        }
      } finally {
        if (mounted) setLoading(false);
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
        cafe_name: cafeName.trim() || "همسة مزاج",
        logo_url: logoUrl.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        opening_hours: openingHours.trim() || "مفتوح 24 ساعة",
        description: description.trim() || null,
      });

      setMessage("تم حفظ بيانات المقهى بنجاح.");
    } catch (error) {
      console.error(error);
      setMessage("حدث خطأ أثناء حفظ بيانات المقهى.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSocialLink() {
    const name = newSocialName.trim();
    const url = normalizeSocialUrl(newSocialUrl);

    if (!name) {
      setSocialMessage("اكتب اسم الموقع.");
      return;
    }

    if (!url) {
      setSocialMessage("اكتب رابط الموقع.");
      return;
    }

    setSocialLoading(true);
    setSocialMessage("");

    try {
      const created = await createSocialLink({
        name,
        url,
        icon: getSocialIcon(name, url),
        sort_order: socialLinks.length * 10,
      });

      setSocialLinks((current) =>
        [...current, created].sort(
          (a, b) => a.sort_order - b.sort_order
        )
      );

      setNewSocialName("");
      setNewSocialUrl("");
      setSocialMessage("تمت إضافة الموقع بنجاح.");
    } catch (error) {
      console.error(error);
      setSocialMessage("حدث خطأ أثناء إضافة الموقع.");
    } finally {
      setSocialLoading(false);
    }
  }

  function startEditingSocial(link: SocialLink) {
    setEditingSocialId(link.id);
    setEditingSocialName(link.name);
    setEditingSocialUrl(link.url);
    setSocialMessage("");
  }

  function cancelEditingSocial() {
    setEditingSocialId(null);
    setEditingSocialName("");
    setEditingSocialUrl("");
  }

  async function handleUpdateSocialLink() {
    if (!editingSocialId) return;

    const name = editingSocialName.trim();
    const url = normalizeSocialUrl(editingSocialUrl);

    if (!name) {
      setSocialMessage("اكتب اسم الموقع.");
      return;
    }

    if (!url) {
      setSocialMessage("اكتب رابط الموقع.");
      return;
    }

    setSocialLoading(true);
    setSocialMessage("");

    try {
      const updated = await updateSocialLink(editingSocialId, {
        name,
        url,
        icon: getSocialIcon(name, url),
      });

      setSocialLinks((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      cancelEditingSocial();
      setSocialMessage("تم تحديث الموقع بنجاح.");
    } catch (error) {
      console.error(error);
      setSocialMessage("حدث خطأ أثناء تحديث الموقع.");
    } finally {
      setSocialLoading(false);
    }
  }

  async function handleDeleteSocialLink(id: string) {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا الموقع؟"
    );

    if (!confirmed) return;

    setSocialLoading(true);
    setSocialMessage("");

    try {
      await deleteSocialLink(id);

      setSocialLinks((current) =>
        current.filter((item) => item.id !== id)
      );

      if (editingSocialId === id) {
        cancelEditingSocial();
      }

      setSocialMessage("تم حذف الموقع بنجاح.");
    } catch (error) {
      console.error(error);
      setSocialMessage("حدث خطأ أثناء حذف الموقع.");
    } finally {
      setSocialLoading(false);
    }
  }

  async function handleToggleSocialLink(link: SocialLink) {
    setSocialLoading(true);
    setSocialMessage("");

    try {
      const updated = await toggleSocialLink(
        link.id,
        !link.is_active
      );

      setSocialLinks((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch (error) {
      console.error(error);
      setSocialMessage("حدث خطأ أثناء تغيير حالة الموقع.");
    } finally {
      setSocialLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#0b0b0b] p-6 text-white"
      >
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-[#121212] p-10 text-center text-zinc-400">
          جاري تحميل الإعدادات...
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0b0b0b] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-white/10 bg-[#121212] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black">
                <Store size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black sm:text-3xl">
                  إعدادات الموقع
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  تحكم كامل في المقهى والصفحة الرئيسية ومواقع التواصل.
                </p>
              </div>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400"
            >
              <ExternalLink size={18} />
              معاينة الموقع
            </a>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 font-bold text-yellow-400">
            {message}
          </div>
        )}

        <div className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#121212] p-2">
          <div className="flex min-w-max gap-2">
            <TabButton
              active={activeTab === "cafe"}
              onClick={() => setActiveTab("cafe")}
              icon={<Store size={17} />}
              label="بيانات المقهى"
            />
            <TabButton
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              icon={<Home size={17} />}
              label="الصفحة الرئيسية"
            />
            <TabButton
              active={activeTab === "social"}
              onClick={() => setActiveTab("social")}
              icon={<Globe2 size={17} />}
              label="مواقع التواصل"
            />
          </div>
        </div>

        {activeTab === "cafe" && (
          <section className="rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-yellow-400">
                بيانات المقهى
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                المعلومات الأساسية المستخدمة في الموقع.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="اسم المقهى"
                value={cafeName}
                onChange={setCafeName}
                placeholder="همسة مزاج"
              />
              <Field
                label="رابط الشعار"
                value={logoUrl}
                onChange={setLogoUrl}
                placeholder="/images/logo.png"
              />
              <Field
                label="الهاتف"
                value={phone}
                onChange={setPhone}
                placeholder="0594165122"
              />
              <Field
                label="أوقات العمل"
                value={openingHours}
                onChange={setOpeningHours}
                placeholder="مفتوح 24 ساعة"
              />
              <div className="md:col-span-2">
                <Field
                  label="العنوان"
                  value={address}
                  onChange={setAddress}
                  placeholder="الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء"
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="الوصف العام"
                  value={description}
                  onChange={setDescription}
                  placeholder="وصف المقهى..."
                />
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={handleSaveCafeSettings}
                disabled={saving}
                className="w-full rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "جارٍ الحفظ..."
                  : "حفظ بيانات المقهى"}
              </button>
            </div>
          </section>
        )}

        {activeTab === "home" && (
          <div>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
              <a
                href="/admin/cafes"
                className="rounded-xl border border-yellow-500/30 px-4 py-3 font-bold text-yellow-400 hover:bg-yellow-500 hover:text-black"
              >
                إدارة المقاهي / السوبر أدمن
              </a>
            </div>

            <section className="mb-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black">
                    <Star size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      اختيار صور الصفحة الرئيسية
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                      اختر الصور التي تريد ظهورها في الصفحة الرئيسية. النجمة تعني ظهور الصورة، وإزالتها تخفيها من الرئيسية وتبقيها في المعرض.
                    </p>
                  </div>
                </div>

                <a
                  href="/admin/gallery-home"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400"
                >
                  <Star size={18} />
                  إدارة نجوم الصور
                </a>
              </div>
            </section>

            <HomeSettingsPanel />
          </div>
        )}

        {activeTab === "social" && (
          <section className="rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-yellow-400">
                  🌐 مواقع التواصل
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  أضف وعدّل وأخفِ الحسابات الرسمية للمقهى.
                </p>
              </div>
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">
                {socialLinks.length} موقع
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-yellow-500 p-3 text-black">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white">
                    إضافة موقع جديد
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    اكتب الاسم والرابط فقط.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="اسم الموقع"
                  value={newSocialName}
                  onChange={setNewSocialName}
                  placeholder="Instagram"
                />
                <Field
                  label="الرابط"
                  value={newSocialUrl}
                  onChange={setNewSocialUrl}
                  placeholder="https://instagram.com/..."
                />

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    disabled={socialLoading}
                    className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400 disabled:opacity-60"
                  >
                    {socialLoading ? "جارٍ الحفظ..." : "إضافة الموقع"}
                  </button>
                </div>
              </div>

              {socialMessage && (
                <p className="mt-4 text-sm font-bold text-yellow-400">
                  {socialMessage}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-xl px-5 py-3 font-black transition",
        active
          ? "bg-yellow-500 text-black"
          : "text-zinc-400 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-300">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-300">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-500"
      />
    </label>
  );
}
