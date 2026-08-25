"use client";

import { useEffect, useState } from "react";

import {
  Eye,
  EyeOff,
  ImageIcon,
  LayoutDashboard,
  Palette,
  Phone,
  Save,
  Sparkles,
  Star,
  Trophy,
  Upload,
  Users,
  LoaderCircle,
} from "lucide-react";

import {
  getSiteControl,
  updateSiteControl,
  type SiteControl,
} from "@/services/siteControl";

import { supabase } from "@/lib/supabase";
import TypographySettingsPanel from "@/components/admin/settings/TypographySettingsPanel";

type UpdateField = <
  K extends keyof SiteControl
>(
  key: K,
  value: SiteControl[K]
) => void;

export default function HomeSettingsPanel() {
  const [settings, setSettings] =
    useState<SiteControl | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data =
          await getSiteControl();

        if (mounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error(
          "Failed to load site control:",
          error
        );

        if (mounted) {
          setMessage(
            "حدث خطأ أثناء تحميل إعدادات الصفحة الرئيسية."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField: UpdateField = (
    key,
    value
  ) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current
    );
  };

  async function save() {
    if (!settings) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const updated =
        await updateSiteControl(
          settings
        );

      setSettings(updated);

      setMessage(
        "تم حفظ إعدادات الصفحة الرئيسية بنجاح."
      );
    } catch (error) {
      console.error(
        "Failed to save site control:",
        error
      );

      setMessage(
        "حدث خطأ أثناء حفظ إعدادات الصفحة الرئيسية."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setMessage(
        "يرجى اختيار صورة PNG أو JPG أو WEBP."
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage(
        "حجم الشعار يجب ألا يتجاوز 5 ميجابايت."
      );

      return;
    }

    setUploadingLogo(true);
    setMessage("");

    try {
      const extension =
        file.type === "image/png"
          ? "png"
          : file.type ===
              "image/webp"
            ? "webp"
            : "jpg";

      const filePath =
        `logo-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("site-assets")
          .upload(
            filePath,
            file,
            {
              cacheControl:
                "3600",
              contentType:
                file.type,
              upsert: false,
            }
          );

      if (uploadError) {
        console.error(
          "Logo upload error:",
          uploadError
        );

        throw uploadError;
      }

      const {
        data: publicData,
      } =
        supabase.storage
          .from("site-assets")
          .getPublicUrl(
            filePath
          );

      const publicUrl =
        publicData.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "تعذر إنشاء رابط الشعار."
        );
      }

      /*
       * حفظ الشعار في قاعدة البيانات
       * مباشرة بعد نجاح الرفع.
       */
      const updated =
        await updateSiteControl({
          logo_url: publicUrl,
        });

      setSettings(updated);

      setMessage(
        "تم رفع الشعار وحفظه بنجاح."
      );
    } catch (error) {
      console.error(
        "Failed to upload logo:",
        error
      );

      setMessage(
        "حدث خطأ أثناء رفع الشعار. تأكد من إعداد Storage."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#121212] p-10 text-center text-zinc-400">
        جاري تحميل إعدادات الصفحة الرئيسية...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center text-red-400">
        لم يتم العثور على إعدادات الصفحة الرئيسية.
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      {/* رسالة الحالة */}
      {message && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 font-bold text-yellow-400">
          {message}
        </div>
      )}

      {/* =========================================
          رأس الصفحة
      ========================================= */}

      <header className="rounded-3xl border border-white/10 bg-[#121212] p-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black">
              <LayoutDashboard size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                إدارة الصفحة الرئيسية
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                تحكم في كل عنصر من عناصر الصفحة بشكل مستقل.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 px-5 py-3 font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400"
            >
              معاينة الموقع
            </a>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400 disabled:opacity-60"
            >
              <Save size={18} />

              {saving
                ? "جارٍ الحفظ..."
                : "حفظ التغييرات"}
            </button>

          </div>

        </div>
      </header>

      {/* =========================================
          هوية الموقع
      ========================================= */}

      <Section
        title="هوية الموقع"
        description="اسم الموقع والشعار."
        icon={<Sparkles size={22} />}
      >
        <div className="grid gap-5 lg:grid-cols-2">

          {/* اسم الموقع */}
          <FieldBox
            title="اسم الموقع"
            enabled={
              settings.show_site_name
            }
            onToggle={() =>
              updateField(
                "show_site_name",
                !settings.show_site_name
              )
            }
          >
            <Input
              label="الاسم"
              value={
                settings.site_name
              }
              onChange={(v) =>
                updateField(
                  "site_name",
                  v
                )
              }
            />
          </FieldBox>

          {/* =========================================
              الشعار - رفع صورة
          ========================================= */}

          <FieldBox
            title="الشعار"
            enabled={
              settings.show_logo
            }
            onToggle={() =>
              updateField(
                "show_logo",
                !settings.show_logo
              )
            }
          >
            <div className="space-y-5">

              {/* المعاينة */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">

                <div className="mb-4 flex items-center justify-between">

                  <p className="font-bold text-zinc-300">
                    معاينة الشعار
                  </p>

                  <span className="text-xs text-zinc-600">
                    PNG / JPG / WEBP
                  </span>

                </div>

                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-[#050505]">

                  {settings.logo_url ? (
                    <img
                      src={
                        settings.logo_url
                      }
                      alt={
                        settings.site_name ||
                        "شعار المقهى"
                      }
                      className="max-h-48 max-w-[260px] object-contain"
                    />
                  ) : (
                    <div className="text-center text-zinc-600">

                      <ImageIcon
                        size={48}
                        className="mx-auto mb-3"
                      />

                      <p>
                        لم يتم رفع شعار بعد
                      </p>

                    </div>
                  )}

                </div>

              </div>

              {/* زر الرفع */}
              <label
                className={[
                  "flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 font-black text-yellow-400 transition",
                  uploadingLogo
                    ? "cursor-wait opacity-60"
                    : "hover:bg-yellow-500 hover:text-black",
                ].join(" ")}
              >

                {uploadingLogo ? (
                  <>
                    <LoaderCircle
                      size={22}
                      className="animate-spin"
                    />

                    جارٍ رفع الشعار...
                  </>
                ) : (
                  <>
                    <Upload size={22} />

                    تحميل شعار جديد
                  </>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={
                    uploadingLogo
                  }
                  onChange={
                    handleLogoUpload
                  }
                />

              </label>

              <p className="text-xs leading-6 text-zinc-600">
                اختر صورة الشعار من جهازك.
                الحد الأقصى 5 ميجابايت.
                سيتم رفع الصورة وحفظها تلقائيًا.
              </p>

            </div>
          </FieldBox>

        </div>
      </Section>

      {/* =========================================
          Hero
      ========================================= */}

      <Section
        title="Hero"
        description="البانر الرئيسي."
        icon={<Sparkles size={22} />}
        enabled={
          settings.hero_enabled
        }
        onToggle={() =>
          updateField(
            "hero_enabled",
            !settings.hero_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">

          <FieldBox
            title="الشارة"
            enabled={
              settings.show_hero_badge
            }
            onToggle={() =>
              updateField(
                "show_hero_badge",
                !settings.show_hero_badge
              )
            }
          >
            <Input
              label="النص"
              value={
                settings.hero_badge ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "hero_badge",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="العنوان الرئيسي"
            enabled={
              settings.show_hero_title
            }
            onToggle={() =>
              updateField(
                "show_hero_title",
                !settings.show_hero_title
              )
            }
          >
            <Input
              label="العنوان"
              value={
                settings.hero_title ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "hero_title",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="العنوان الفرعي"
            enabled={
              settings.show_hero_subtitle
            }
            onToggle={() =>
              updateField(
                "show_hero_subtitle",
                !settings.show_hero_subtitle
              )
            }
          >
            <Input
              label="النص"
              value={
                settings.hero_subtitle ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "hero_subtitle",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="الوصف"
            enabled={
              settings.show_hero_description
            }
            onToggle={() =>
              updateField(
                "show_hero_description",
                !settings.show_hero_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.hero_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "hero_description",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="صورة الخلفية"
            enabled={
              settings.show_hero_background
            }
            onToggle={() =>
              updateField(
                "show_hero_background",
                !settings.show_hero_background
              )
            }
          >
            <Input
              label="الرابط"
              value={
                settings.hero_background_url ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "hero_background_url",
                  v
                )
              }
              placeholder="/images/cafe.jpg"
            />
          </FieldBox>

          <FieldBox
            title="الزر الأول"
            enabled={
              settings.show_hero_primary_button
            }
            onToggle={() =>
              updateField(
                "show_hero_primary_button",
                !settings.show_hero_primary_button
              )
            }
          >
            <div className="space-y-4">

              <Input
                label="النص"
                value={
                  settings.hero_primary_text ||
                  ""
                }
                onChange={(v) =>
                  updateField(
                    "hero_primary_text",
                    v
                  )
                }
              />

              <Input
                label="الرابط"
                value={
                  settings.hero_primary_url ||
                  ""
                }
                onChange={(v) =>
                  updateField(
                    "hero_primary_url",
                    v
                  )
                }
              />

            </div>
          </FieldBox>

          <FieldBox
            title="الزر الثاني"
            enabled={
              settings.show_hero_secondary_button
            }
            onToggle={() =>
              updateField(
                "show_hero_secondary_button",
                !settings.show_hero_secondary_button
              )
            }
          >
            <div className="space-y-4">

              <Input
                label="النص"
                value={
                  settings.hero_secondary_text ||
                  ""
                }
                onChange={(v) =>
                  updateField(
                    "hero_secondary_text",
                    v
                  )
                }
              />

              <Input
                label="الرابط"
                value={
                  settings.hero_secondary_url ||
                  ""
                }
                onChange={(v) =>
                  updateField(
                    "hero_secondary_url",
                    v
                  )
                }
              />

            </div>
          </FieldBox>

        </div>
      </Section>

      {/* =========================================
          المنتجات المميزة
      ========================================= */}

      <Section
        title="المنتجات المميزة"
        description="المنتجات التي تظهر في الصفحة الرئيسية."
        icon={<Star size={22} />}
        enabled={
          settings.featured_enabled
        }
        onToggle={() =>
          updateField(
            "featured_enabled",
            !settings.featured_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">

          <FieldBox
            title="عنوان القسم"
            enabled={
              settings.show_featured_title
            }
            onToggle={() =>
              updateField(
                "show_featured_title",
                !settings.show_featured_title
              )
            }
          >
            <Input
              label="العنوان"
              value={
                settings.featured_title ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "featured_title",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="وصف القسم"
            enabled={
              settings.show_featured_description
            }
            onToggle={() =>
              updateField(
                "show_featured_description",
                !settings.show_featured_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.featured_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "featured_description",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="المنتجات"
            enabled={
              settings.show_featured_products
            }
            onToggle={() =>
              updateField(
                "show_featured_products",
                !settings.show_featured_products
              )
            }
          >
            <Input
              label="عدد المنتجات"
              type="number"
              value={String(
                settings.featured_limit
              )}
              onChange={(v) =>
                updateField(
                  "featured_limit",
                  Math.max(
                    1,
                    Number(v) || 1
                  )
                )
              }
            />
          </FieldBox>

          <ToggleBox
            title="الأسعار"
            enabled={
              settings.show_featured_prices
            }
            onToggle={() =>
              updateField(
                "show_featured_prices",
                !settings.show_featured_prices
              )
            }
          />

          <ToggleBox
            title="شارة مميز"
            enabled={
              settings.show_featured_badge
            }
            onToggle={() =>
              updateField(
                "show_featured_badge",
                !settings.show_featured_badge
              )
            }
          />

          <ToggleBox
            title="زر عرض المنيو"
            enabled={
              settings.show_featured_button
            }
            onToggle={() =>
              updateField(
                "show_featured_button",
                !settings.show_featured_button
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          لماذا نحن
      ========================================= */}

      <Section
        title="لماذا نحن؟"
        description="مميزات المقهى."
        icon={<Sparkles size={22} />}
        enabled={
          settings.why_enabled
        }
        onToggle={() =>
          updateField(
            "why_enabled",
            !settings.why_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">

          <FieldBox
            title="العنوان"
            enabled={
              settings.show_why_title
            }
            onToggle={() =>
              updateField(
                "show_why_title",
                !settings.show_why_title
              )
            }
          >
            <Input
              label="العنوان"
              value={
                settings.why_title ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "why_title",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="الوصف"
            enabled={
              settings.show_why_description
            }
            onToggle={() =>
              updateField(
                "show_why_description",
                !settings.show_why_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.why_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "why_description",
                  v
                )
              }
            />
          </FieldBox>

          <ToggleBox
            title="المميزات"
            enabled={
              settings.show_why_features
            }
            onToggle={() =>
              updateField(
                "show_why_features",
                !settings.show_why_features
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          المباريات
      ========================================= */}

      <Section
        title="المباريات"
        description="قسم المباريات."
        icon={<Trophy size={22} />}
        enabled={
          settings.matches_enabled
        }
        onToggle={() =>
          updateField(
            "matches_enabled",
            !settings.matches_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">

          <FieldBox
            title="العنوان"
            enabled={
              settings.show_matches_title
            }
            onToggle={() =>
              updateField(
                "show_matches_title",
                !settings.show_matches_title
              )
            }
          >
            <Input
              label="العنوان"
              value={
                settings.matches_title ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "matches_title",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="الوصف"
            enabled={
              settings.show_matches_description
            }
            onToggle={() =>
              updateField(
                "show_matches_description",
                !settings.show_matches_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.matches_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "matches_description",
                  v
                )
              }
            />
          </FieldBox>

          <ToggleBox
            title="قائمة المباريات"
            enabled={
              settings.show_matches_list
            }
            onToggle={() =>
              updateField(
                "show_matches_list",
                !settings.show_matches_list
              )
            }
          />

          <ToggleBox
            title="زر المباريات"
            enabled={
              settings.show_matches_button
            }
            onToggle={() =>
              updateField(
                "show_matches_button",
                !settings.show_matches_button
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          المعرض
      ========================================= */}

      <Section
        title="المعرض"
        description="صور وأجواء المقهى."
        icon={<ImageIcon size={22} />}
        enabled={
          settings.gallery_enabled
        }
        onToggle={() =>
          updateField(
            "gallery_enabled",
            !settings.gallery_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">

          <FieldBox
            title="العنوان"
            enabled={
              settings.show_gallery_title
            }
            onToggle={() =>
              updateField(
                "show_gallery_title",
                !settings.show_gallery_title
              )
            }
          >
            <Input
              label="العنوان"
              value={
                settings.gallery_title ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "gallery_title",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="الوصف"
            enabled={
              settings.show_gallery_description
            }
            onToggle={() =>
              updateField(
                "show_gallery_description",
                !settings.show_gallery_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.gallery_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "gallery_description",
                  v
                )
              }
            />
          </FieldBox>

          <ToggleBox
            title="الصور"
            enabled={
              settings.show_gallery_images
            }
            onToggle={() =>
              updateField(
                "show_gallery_images",
                !settings.show_gallery_images
              )
            }
          />

          <ToggleBox
            title="زر جميع الصور"
            enabled={
              settings.show_gallery_button
            }
            onToggle={() =>
              updateField(
                "show_gallery_button",
                !settings.show_gallery_button
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          آراء العملاء
      ========================================= */}

      <Section
        title="آراء العملاء"
        description="التقييمات والآراء."
        icon={<Users size={22} />}
        enabled={
          settings.testimonials_enabled
        }
        onToggle={() =>
          updateField(
            "testimonials_enabled",
            !settings.testimonials_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">

          <FieldBox
            title="العنوان"
            enabled={
              settings.show_testimonials_title
            }
            onToggle={() =>
              updateField(
                "show_testimonials_title",
                !settings.show_testimonials_title
              )
            }
          >
            <Input
              label="العنوان"
              value={
                settings.testimonials_title ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "testimonials_title",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="الوصف"
            enabled={
              settings.show_testimonials_description
            }
            onToggle={() =>
              updateField(
                "show_testimonials_description",
                !settings.show_testimonials_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.testimonials_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "testimonials_description",
                  v
                )
              }
            />
          </FieldBox>

          <ToggleBox
            title="التقييمات"
            enabled={
              settings.show_testimonials_list
            }
            onToggle={() =>
              updateField(
                "show_testimonials_list",
                !settings.show_testimonials_list
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          التواصل
      ========================================= */}

      <Section
        title="التواصل"
        description="بيانات التواصل والخريطة."
        icon={<Phone size={22} />}
        enabled={
          settings.contact_enabled
        }
        onToggle={() =>
          updateField(
            "contact_enabled",
            !settings.contact_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">

          <FieldBox
            title="عنوان القسم"
            enabled={
              settings.show_contact_title
            }
            onToggle={() =>
              updateField(
                "show_contact_title",
                !settings.show_contact_title
              )
            }
          >
            <Input
              label="العنوان"
              value={
                settings.contact_title ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "contact_title",
                  v
                )
              }
            />
          </FieldBox>

          <FieldBox
            title="وصف القسم"
            enabled={
              settings.show_contact_description
            }
            onToggle={() =>
              updateField(
                "show_contact_description",
                !settings.show_contact_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.contact_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "contact_description",
                  v
                )
              }
            />
          </FieldBox>

          <ToggleBox
            title="العنوان"
            enabled={
              settings.show_contact_address
            }
            onToggle={() =>
              updateField(
                "show_contact_address",
                !settings.show_contact_address
              )
            }
          />

          <ToggleBox
            title="الهاتف"
            enabled={
              settings.show_contact_phone
            }
            onToggle={() =>
              updateField(
                "show_contact_phone",
                !settings.show_contact_phone
              )
            }
          />

          <ToggleBox
            title="أوقات العمل"
            enabled={
              settings.show_contact_hours
            }
            onToggle={() =>
              updateField(
                "show_contact_hours",
                !settings.show_contact_hours
              )
            }
          />

          <ToggleBox
            title="الخريطة"
            enabled={
              settings.show_contact_map
            }
            onToggle={() =>
              updateField(
                "show_contact_map",
                !settings.show_contact_map
              )
            }
          />

          <ToggleBox
            title="مواقع التواصل"
            enabled={
              settings.show_contact_social_links
            }
            onToggle={() =>
              updateField(
                "show_contact_social_links",
                !settings.show_contact_social_links
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          Footer
      ========================================= */}

      <Section
        title="Footer"
        description="أسفل الموقع."
        icon={<LayoutDashboard size={22} />}
        enabled={
          settings.footer_enabled
        }
        onToggle={() =>
          updateField(
            "footer_enabled",
            !settings.footer_enabled
          )
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">

          <FieldBox
            title="الوصف"
            enabled={
              settings.show_footer_description
            }
            onToggle={() =>
              updateField(
                "show_footer_description",
                !settings.show_footer_description
              )
            }
          >
            <TextArea
              label="الوصف"
              value={
                settings.footer_description ||
                ""
              }
              onChange={(v) =>
                updateField(
                  "footer_description",
                  v
                )
              }
            />
          </FieldBox>

          <ToggleBox
            title="روابط الصفحات"
            enabled={
              settings.show_footer_links
            }
            onToggle={() =>
              updateField(
                "show_footer_links",
                !settings.show_footer_links
              )
            }
          />

          <ToggleBox
            title="معلومات التواصل"
            enabled={
              settings.show_footer_contact
            }
            onToggle={() =>
              updateField(
                "show_footer_contact",
                !settings.show_footer_contact
              )
            }
          />

          <ToggleBox
            title="مواقع التواصل"
            enabled={
              settings.show_footer_social_links
            }
            onToggle={() =>
              updateField(
                "show_footer_social_links",
                !settings.show_footer_social_links
              )
            }
          />

          <ToggleBox
            title="حقوق النشر"
            enabled={
              settings.show_footer_copyright
            }
            onToggle={() =>
              updateField(
                "show_footer_copyright",
                !settings.show_footer_copyright
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          المظهر
      ========================================= */}

      <Section
        title="المظهر"
        description="ألوان الموقع."
        icon={<Palette size={22} />}
      >
        <div className="grid gap-5 md:grid-cols-3">

          <ColorField
            label="اللون الرئيسي"
            value={
              settings.primary_color
            }
            onChange={(v) =>
              updateField(
                "primary_color",
                v
              )
            }
          />

          <ColorField
            label="الخلفية"
            value={
              settings.background_color
            }
            onChange={(v) =>
              updateField(
                "background_color",
                v
              )
            }
          />

          <ColorField
            label="البطاقات"
            value={
              settings.surface_color
            }
            onChange={(v) =>
              updateField(
                "surface_color",
                v
              )
            }
          />

        </div>
      </Section>

      {/* =========================================
          أحجام الخطوط
      ========================================= */}

      <TypographySettingsPanel />

      {/* =========================================
          حفظ
      ========================================= */}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="sticky bottom-4 z-20 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black shadow-2xl transition hover:bg-yellow-400 disabled:opacity-60"
      >
        <Save size={20} />

        {saving
          ? "جارٍ الحفظ..."
          : "حفظ جميع التغييرات"}
      </button>
    </div>
  );
}

/* =========================================================
   Section
========================================================= */

function Section({
  title,
  description,
  icon,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212]">

      <div className="border-b border-white/10 p-5 sm:p-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black">
              {icon}
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                {title}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {description}
              </p>
            </div>

          </div>

          {typeof enabled ===
            "boolean" &&
            onToggle && (
              <VisibilityButton
                enabled={enabled}
                onToggle={onToggle}
              />
            )}

        </div>

      </div>

      {enabled === false ? (
        <div className="p-8 text-center text-sm text-zinc-600">
          هذا القسم مخفي حاليًا.
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          {children}
        </div>
      )}

    </section>
  );
}

/* =========================================================
   FieldBox
========================================================= */

function FieldBox({
  title,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <h3 className="font-black text-white">
          {title}
        </h3>

        <VisibilityButton
          enabled={enabled}
          onToggle={onToggle}
        />

      </div>

      {enabled ? (
        children
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center text-sm text-zinc-600">
          هذا العنصر مخفي.
        </div>
      )}

    </div>
  );
}

/* =========================================================
   ToggleBox
========================================================= */

function ToggleBox({
  title,
  enabled,
  onToggle,
}: {
  title: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <FieldBox
      title={title}
      enabled={enabled}
      onToggle={onToggle}
    >
      <p className="text-sm leading-7 text-zinc-500">
        التحكم في ظهور هذا العنصر داخل الموقع.
      </p>
    </FieldBox>
  );
}

/* =========================================================
   VisibilityButton
========================================================= */

function VisibilityButton({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "inline-flex min-w-[100px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition",
        enabled
          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
          : "bg-red-500/10 text-red-400 hover:bg-red-500/20",
      ].join(" ")}
    >
      {enabled ? (
        <>
          <Eye size={17} />
          إظهار
        </>
      ) : (
        <>
          <EyeOff size={17} />
          إخفاء
        </>
      )}
    </button>
  );
}

/* =========================================================
   Input
========================================================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-zinc-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
      />

    </div>
  );
}

/* =========================================================
   TextArea
========================================================= */

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-zinc-300">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        rows={4}
        className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
      />

    </div>
  );
}

/* =========================================================
   ColorField
========================================================= */

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-zinc-300">
        {label}
      </label>

      <div className="flex gap-3">

        <input
          type="color"
          value={
            /^#[0-9a-fA-F]{6}$/.test(
              value
            )
              ? value
              : "#000000"
          }
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="h-12 w-14 cursor-pointer rounded-xl border border-white/10 bg-black p-1"
        />

        <input
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
        />

      </div>

    </div>
  );
}