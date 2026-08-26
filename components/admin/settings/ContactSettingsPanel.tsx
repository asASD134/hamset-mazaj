"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  Link2,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Edit3,
  Clock3,
  Mail,
  MessageCircle,
} from "lucide-react";

import {
  getCafeSettings,
  updateCafeSettings,
  type CafeSettings,
} from "@/services/cafeSettings";
import {
  getSiteControl,
  updateSiteControl,
  type SiteControl,
} from "@/services/siteControl";
import {
  createSocialLink,
  deleteSocialLink,
  getSocialLinks,
  toggleSocialLink,
  updateSocialLink,
  type SocialLink,
} from "@/services/socialLinks";

type ContactDraft = {
  cafe_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  maps_url: string;
  opening_hours: string;
  description: string;
  contact_title: string;
  contact_description: string;
  show_contact_address: boolean;
  show_contact_phone: boolean;
  show_contact_hours: boolean;
  show_contact_map: boolean;
  show_contact_social_links: boolean;
};

function iconFor(name: string, url: string) {
  const value = `${name} ${url}`.toLowerCase();
  if (value.includes("instagram")) return "📸";
  if (value.includes("facebook") || value.includes("fb.com")) return "📘";
  if (value.includes("youtube") || value.includes("youtu.be")) return "▶️";
  if (value.includes("tiktok")) return "🎵";
  if (value.includes("snapchat")) return "👻";
  if (value.includes("whatsapp") || value.includes("wa.me")) return "💬";
  if (value.includes("telegram") || value.includes("t.me")) return "✈️";
  if (value.includes("x.com") || value.includes("twitter")) return "𝕏";
  if (value.includes("mailto:") || value.includes("email")) return "✉️";
  if (value.includes("maps.app") || value.includes("google.com/maps")) return "📍";
  return "🔗";
}

function normalizeUrl(value: string) {
  const clean = value.trim();
  if (!clean) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(clean)) return clean;
  return `https://${clean}`;
}

export default function ContactSettingsPanel() {
  const [cafe, setCafe] = useState<CafeSettings | null>(null);
  const [site, setSite] = useState<SiteControl | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialSaving, setSocialSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingUrl, setEditingUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([getCafeSettings(), getSiteControl(), getSocialLinks()])
      .then(([cafeRow, siteRow, socialRows]) => {
        if (!mounted) return;
        setCafe(cafeRow);
        setSite(siteRow);
        setLinks(socialRows);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) setMessage("حدث خطأ أثناء تحميل بيانات التواصل.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const draft: ContactDraft | null = useMemo(() => {
    if (!cafe || !site) return null;
    return {
      cafe_name: cafe.cafe_name || site.site_name || "",
      phone: cafe.phone || "",
      whatsapp: cafe.whatsapp || "",
      email: cafe.email || "",
      address: cafe.address || "",
      maps_url: cafe.maps_url || "",
      opening_hours: cafe.opening_hours || "",
      description: cafe.description || "",
      contact_title: site.contact_title || "",
      contact_description: site.contact_description || "",
      show_contact_address: site.show_contact_address,
      show_contact_phone: site.show_contact_phone,
      show_contact_hours: site.show_contact_hours,
      show_contact_map: site.show_contact_map,
      show_contact_social_links: site.show_contact_social_links,
    };
  }, [cafe, site]);

  function patchDraft(patch: Partial<ContactDraft>) {
    if (!draft) return;
    setCafe((current) =>
      current
        ? {
            ...current,
            cafe_name: patch.cafe_name ?? current.cafe_name,
            phone: patch.phone ?? current.phone,
            whatsapp: patch.whatsapp ?? current.whatsapp,
            email: patch.email ?? current.email,
            address: patch.address ?? current.address,
            maps_url: patch.maps_url ?? current.maps_url,
            opening_hours: patch.opening_hours ?? current.opening_hours,
            description: patch.description ?? current.description,
          }
        : current
    );
    setSite((current) =>
      current
        ? {
            ...current,
            contact_title: patch.contact_title ?? current.contact_title,
            contact_description:
              patch.contact_description ?? current.contact_description,
            show_contact_address:
              patch.show_contact_address ?? current.show_contact_address,
            show_contact_phone:
              patch.show_contact_phone ?? current.show_contact_phone,
            show_contact_hours:
              patch.show_contact_hours ?? current.show_contact_hours,
            show_contact_map:
              patch.show_contact_map ?? current.show_contact_map,
            show_contact_social_links:
              patch.show_contact_social_links ?? current.show_contact_social_links,
          }
        : current
    );
  }

  async function saveContact() {
    if (!draft) return;
    setSaving(true);
    setMessage("");
    try {
      const [updatedCafe, updatedSite] = await Promise.all([
        updateCafeSettings({
          cafe_name: draft.cafe_name.trim() || null,
          phone: draft.phone.trim() || null,
          whatsapp: draft.whatsapp.trim() || null,
          email: draft.email.trim() || null,
          address: draft.address.trim() || null,
          maps_url: normalizeUrl(draft.maps_url) || null,
          opening_hours: draft.opening_hours.trim() || null,
          description: draft.description.trim() || null,
        }),
        updateSiteControl({
          contact_title: draft.contact_title.trim() || null,
          contact_description: draft.contact_description.trim() || null,
          show_contact_address: draft.show_contact_address,
          show_contact_phone: draft.show_contact_phone,
          show_contact_hours: draft.show_contact_hours,
          show_contact_map: draft.show_contact_map,
          show_contact_social_links: draft.show_contact_social_links,
        }),
      ]);
      setCafe(updatedCafe);
      setSite(updatedSite);
      setMessage("تم حفظ بيانات التواصل بنجاح.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "تعذر حفظ بيانات التواصل.");
    } finally {
      setSaving(false);
    }
  }

  async function addSocial() {
    const name = newName.trim();
    const url = normalizeUrl(newUrl);
    if (!name || !url) {
      setMessage("اكتب اسم الموقع والرابط.");
      return;
    }

    setSocialSaving(true);
    setMessage("");
    try {
      const created = await createSocialLink({
        name,
        url,
        icon: iconFor(name, url),
        sort_order: links.length * 10,
      });
      setLinks((current) => [...current, created].sort((a, b) => a.sort_order - b.sort_order));
      setNewName("");
      setNewUrl("");
      setMessage("تمت إضافة موقع التواصل.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "تعذر إضافة موقع التواصل.");
    } finally {
      setSocialSaving(false);
    }
  }

  async function saveSocial(id: string) {
    const name = editingName.trim();
    const url = normalizeUrl(editingUrl);
    if (!name || !url) {
      setMessage("اكتب الاسم والرابط.");
      return;
    }
    setSocialSaving(true);
    try {
      const updated = await updateSocialLink(id, {
        name,
        url,
        icon: iconFor(name, url),
      });
      setLinks((current) => current.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
      setMessage("تم تحديث موقع التواصل.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "تعذر تحديث موقع التواصل.");
    } finally {
      setSocialSaving(false);
    }
  }

  async function removeSocial(id: string) {
    if (!window.confirm("هل تريد حذف موقع التواصل؟")) return;
    setSocialSaving(true);
    try {
      await deleteSocialLink(id);
      setLinks((current) => current.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
      setMessage("تم حذف موقع التواصل.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "تعذر حذف موقع التواصل.");
    } finally {
      setSocialSaving(false);
    }
  }

  async function toggleSocial(link: SocialLink) {
    setSocialSaving(true);
    try {
      const updated = await toggleSocialLink(link.id, !link.is_active);
      setLinks((current) => current.map((item) => (item.id === link.id ? updated : item)));
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "تعذر تغيير حالة موقع التواصل.");
    } finally {
      setSocialSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#121212] p-8 text-center text-zinc-400">
        جاري تحميل بيانات التواصل...
      </section>
    );
  }

  if (!draft) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
        تعذر تحميل بيانات التواصل.
      </section>
    );
  }

  return (
    <section dir="rtl" className="mb-6 rounded-3xl border border-yellow-500/20 bg-[#121212] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black">
              <Phone size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-yellow-400">بيانات التواصل الفعلية</h2>
              <p className="mt-1 text-sm text-zinc-500">الاسم، الهاتف، واتساب، البريد، العنوان، الخريطة، أوقات العمل ومواقع التواصل.</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={saveContact}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400 disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "جارٍ الحفظ..." : "حفظ بيانات التواصل"}
        </button>
      </div>

      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Input label="اسم الموقع / المقهى" value={draft.cafe_name} onChange={(value) => patchDraft({ cafe_name: value })} icon={<Globe2 size={17} />} />
        <Input label="رقم الهاتف" value={draft.phone} onChange={(value) => patchDraft({ phone: value })} icon={<Phone size={17} />} />
        <Input label="رقم واتساب" value={draft.whatsapp} onChange={(value) => patchDraft({ whatsapp: value })} icon={<MessageCircle size={17} />} />
        <Input label="البريد الإلكتروني" value={draft.email} onChange={(value) => patchDraft({ email: value })} icon={<Mail size={17} />} />
        <Input label="العنوان" value={draft.address} onChange={(value) => patchDraft({ address: value })} icon={<MapPin size={17} />} />
        <Input label="رابط الخريطة" value={draft.maps_url} onChange={(value) => patchDraft({ maps_url: value })} icon={<Link2 size={17} />} />
        <Input label="أوقات العمل" value={draft.opening_hours} onChange={(value) => patchDraft({ opening_hours: value })} icon={<Clock3 size={17} />} />
        <Input label="عنوان قسم التواصل" value={draft.contact_title} onChange={(value) => patchDraft({ contact_title: value })} icon={<Phone size={17} />} />
        <div className="lg:col-span-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-300">وصف قسم التواصل</span>
            <textarea value={draft.contact_description} onChange={(event) => patchDraft({ contact_description: event.target.value })} rows={4} className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500" />
          </label>
        </div>
        <div className="lg:col-span-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-300">الوصف العام للموقع</span>
            <textarea value={draft.description} onChange={(event) => patchDraft({ description: event.target.value })} rows={4} className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500" />
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Toggle label="إظهار العنوان" enabled={draft.show_contact_address} onToggle={() => patchDraft({ show_contact_address: !draft.show_contact_address })} />
        <Toggle label="إظهار الهاتف" enabled={draft.show_contact_phone} onToggle={() => patchDraft({ show_contact_phone: !draft.show_contact_phone })} />
        <Toggle label="إظهار أوقات العمل" enabled={draft.show_contact_hours} onToggle={() => patchDraft({ show_contact_hours: !draft.show_contact_hours })} />
        <Toggle label="إظهار الخريطة" enabled={draft.show_contact_map} onToggle={() => patchDraft({ show_contact_map: !draft.show_contact_map })} />
        <Toggle label="إظهار مواقع التواصل" enabled={draft.show_contact_social_links} onToggle={() => patchDraft({ show_contact_social_links: !draft.show_contact_social_links })} />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-black text-white">مواقع التواصل والروابط</h3>
            <p className="mt-1 text-sm text-zinc-500">أضف الرابط نفسه، غيّر الاسم، عدّل الرابط أو أخفِ الموقع.</p>
          </div>
          <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-black text-yellow-300">{links.length} رابط</div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="اسم الموقع مثل Instagram" className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-500" />
          <input value={newUrl} onChange={(event) => setNewUrl(event.target.value)} placeholder="https://..." className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-yellow-500" />
          <button type="button" onClick={addSocial} disabled={socialSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black hover:bg-yellow-400 disabled:opacity-60">
            <Plus size={18} />
            إضافة
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {links.map((link) => (
            <div key={link.id} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
              {editingId === link.id ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  <input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500" />
                  <input value={editingUrl} onChange={(event) => setEditingUrl(event.target.value)} className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500" />
                  <div className="flex gap-2 lg:col-span-2">
                    <button type="button" onClick={() => saveSocial(link.id)} disabled={socialSaving} className="rounded-xl bg-yellow-500 px-4 py-2 font-black text-black">حفظ</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-xl border border-white/10 px-4 py-2 font-bold text-zinc-300">إلغاء</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{link.icon || "🔗"}</span>
                      <div>
                        <div className="font-black text-white">{link.name}</div>
                        <div className="break-all text-sm text-zinc-500">{link.url}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => { setEditingId(link.id); setEditingName(link.name); setEditingUrl(link.url); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 hover:text-white"><Edit3 size={15} /> تعديل</button>
                    <button type="button" onClick={() => void toggleSocial(link)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300">{link.is_active ? <Eye size={15} /> : <EyeOff size={15} />} {link.is_active ? "إظهار" : "مخفي"}</button>
                    <button type="button" onClick={() => void removeSocial(link.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10"><Trash2 size={15} /> حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {links.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">لا توجد مواقع تواصل. أضف أول رابط من الأعلى.</div>}
        </div>
      </div>
    </section>
  );
}

function Input({ label, value, onChange, icon }: { label: string; value: string; onChange: (value: string) => void; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-300">{icon}{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500" />
    </label>
  );
}

function Toggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={["flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition", enabled ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"].join(" ")}>
      {enabled ? <Eye size={16} /> : <EyeOff size={16} />}
      {label}: {enabled ? "إظهار" : "إخفاء"}
    </button>
  );
}
