"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  getSiteControl,
  updateSiteControl,
  type SiteControl,
  type SiteTypography,
} from "@/services/siteControl";

import { supabase } from "@/lib/supabase";
import { getMenuCategories } from "@/modules/menu/services/menu.service";

type UpdateField = <
  K extends keyof SiteControl
>(
  key: K,
  value: SiteControl[K]
) => void;

type FeaturedProductOption = {
  id: string;
  name: string;
  categoryName: string;
  price: number | string;
  image: string | null;
};

type TypographyEditorContextValue = {
  typography: SiteTypography;
  updateSize: (
    key: keyof SiteTypography,
    device: "desktop" | "mobile",
    value: number
  ) => void;
  resetSize: (key: keyof SiteTypography) => void;
  saveTypography: () => Promise<void>;
  savingTypography: boolean;
};

const TypographyEditorContext =
  createContext<TypographyEditorContextValue | null>(null);

function useTypographyEditor() {
  const context = useContext(
    TypographyEditorContext
  );

  if (!context) {
    throw new Error(
      "useTypographyEditor must be used inside TypographyEditorContext"
    );
  }

  return context;
}

type TypographyKey = keyof SiteTypography;

const typographyLabels: Record<TypographyKey, string> = {
  navbar_site_name: "اسم الموقع في الهيدر",
  navbar_links: "روابط الهيدر",
  hero_title: "العنوان الرئيسي",
  hero_subtitle: "العنوان المختصر",
  hero_description: "وصف Hero",
  featured_title: "عنوان المنتجات المميزة",
  featured_description: "وصف المنتجات المميزة",
  featured_product_name: "اسم المنتج",
  featured_price: "سعر المنتج",
  why_title: "عنوان لماذا نحن",
  why_description: "وصف لماذا نحن",
  matches_title: "عنوان قسم المباريات",
  matches_description: "وصف قسم المباريات",
  matches_date: "تاريخ المباراة",
  matches_time: "وقت المباراة",
  matches_competition: "اسم البطولة",
  matches_team_name: "أسماء الفرق",
  matches_countdown: "العداد التنازلي",
  gallery_title: "عنوان المعرض",
  gallery_description: "وصف المعرض",
  testimonials_title: "عنوان آراء العملاء",
  testimonials_description: "وصف آراء العملاء",
  contact_title: "عنوان التواصل",
  contact_description: "وصف التواصل",
  contact_text: "نصوص التواصل",
  footer_text: "نصوص Footer",
};


const DEFAULT_SITE_COLORS = {
  primary: "#EAB308",
  background: "#0A0A0A",
  surface: "#121212",
} as const;

const DEFAULT_GALLERY_IMAGES = [
  "/images/gallery1.jpg",
  "/images/gallery2.jpg",
  "/images/gallery3.jpg",
  "/images/gallery4.jpg",
  "/images/gallery5.jpg",
  "/images/gallery6.jpg",
] as const;

const DEFAULT_GALLERY_VISIBILITY = [
  true,
  true,
  true,
  true,
  true,
  true,
] as const;

const MAX_GALLERY_IMAGES = 100;

function normalizeHexColor(value: string, fallback: string) {
  const normalized = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized)
    ? normalized
    : fallback;
}

const defaultTypography: SiteTypography = {
  navbar_site_name: { desktop: 16, mobile: 14 },
  navbar_links: { desktop: 14, mobile: 13 },
  hero_title: { desktop: 64, mobile: 42 },
  hero_subtitle: { desktop: 30, mobile: 22 },
  hero_description: { desktop: 20, mobile: 16 },
  featured_title: { desktop: 40, mobile: 30 },
  featured_description: { desktop: 18, mobile: 16 },
  featured_product_name: { desktop: 24, mobile: 20 },
  featured_price: { desktop: 22, mobile: 19 },
  why_title: { desktop: 40, mobile: 30 },
  why_description: { desktop: 18, mobile: 16 },
  matches_title: { desktop: 38, mobile: 30 },
  matches_description: { desktop: 18, mobile: 16 },
  matches_date: { desktop: 18, mobile: 16 },
  matches_time: { desktop: 28, mobile: 22 },
  matches_competition: { desktop: 15, mobile: 14 },
  matches_team_name: { desktop: 21, mobile: 18 },
  matches_countdown: { desktop: 14, mobile: 13 },
  gallery_title: { desktop: 40, mobile: 30 },
  gallery_description: { desktop: 18, mobile: 16 },
  testimonials_title: { desktop: 40, mobile: 30 },
  testimonials_description: { desktop: 18, mobile: 16 },
  contact_title: { desktop: 40, mobile: 30 },
  contact_description: { desktop: 18, mobile: 16 },
  contact_text: { desktop: 18, mobile: 16 },
  footer_text: { desktop: 16, mobile: 14 },
};


export default function HomeSettingsPanel() {
  const [settings, setSettings] =
    useState<SiteControl | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [uploadingBackground, setUploadingBackground] =
    useState(false);

  const [uploadingGallery, setUploadingGallery] =
    useState(false);

  const [featuredOptions, setFeaturedOptions] =
    useState<FeaturedProductOption[]>([]);

  const [featuredLoading, setFeaturedLoading] =
    useState(true);

  const [featuredSearch, setFeaturedSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data =
          await getSiteControl();

        if (mounted) {
          const normalizedGalleryImages =
            Array.isArray(data?.gallery_images) &&
            data.gallery_images.length > 0
              ? data.gallery_images.filter(
                  (image): image is string =>
                    typeof image === "string" && image.length > 0
                )
              : Array.from(DEFAULT_GALLERY_IMAGES);

          const normalizedGalleryVisibility =
            Array.isArray(data?.gallery_images_visible)
              ? normalizedGalleryImages.map(
                  (_, index) =>
                    data.gallery_images_visible?.[index] !== false
                )
              : normalizedGalleryImages.map(() => true);

          setSettings(
            data
              ? {
                  ...data,
                  gallery_images:
                    normalizedGalleryImages,
                  gallery_images_visible:
                    normalizedGalleryVisibility,
                }
              : data
          );
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

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedOptions() {
      try {
        const categories = await getMenuCategories();

        if (!mounted) {
          return;
        }

        const rawCategories = categories as unknown as Array<{
          name?: string;
          name_ar?: string;
          items?: Array<{
            id: string | number;
            name: string;
            price: number | string;
            image?: string | null;
          }>;
        }>;

        const options: FeaturedProductOption[] =
          rawCategories.flatMap((category) =>
            (category.items || []).map((item) => ({
              id: String(item.id),
              name: item.name,
              categoryName:
                category.name_ar ||
                category.name ||
                "قسم",
              price: item.price,
              image: item.image || null,
            }))
          );

        setFeaturedOptions(options);
      } catch (error) {
        console.error(
          "Failed to load featured product options:",
          error
        );

        if (mounted) {
          setFeaturedOptions([]);
        }
      } finally {
        if (mounted) {
          setFeaturedLoading(false);
        }
      }
    }

    loadFeaturedOptions();

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

    const primaryColor = normalizeHexColor(
      settings.primary_color,
      DEFAULT_SITE_COLORS.primary
    );

    const backgroundColor = normalizeHexColor(
      settings.background_color,
      DEFAULT_SITE_COLORS.background
    );

    const surfaceColor = normalizeHexColor(
      settings.surface_color,
      DEFAULT_SITE_COLORS.surface
    );

    const safeSettings: SiteControl = {
      ...settings,
      primary_color: primaryColor,
      background_color: backgroundColor,
      surface_color: surfaceColor,
    };

    setSaving(true);
    setMessage("");

    try {
      const updated =
        await updateSiteControl(
          safeSettings
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


  async function handleHeroBackgroundUpload(
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

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "يرجى اختيار صورة PNG أو JPG أو WEBP."
      );
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage(
        "حجم صورة الخلفية يجب ألا يتجاوز 10 ميجابايت."
      );
      return;
    }

    setUploadingBackground(true);
    setMessage("");

    try {
      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      const filePath =
        `hero-background-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("site-assets")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          "Hero background upload error:",
          uploadError
        );

        throw uploadError;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      const publicUrl =
        publicData.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "تعذر إنشاء رابط صورة الخلفية."
        );
      }

      const updated =
        await updateSiteControl({
          hero_background_url:
            publicUrl,
        });

      setSettings(updated);

      setMessage(
        "تم رفع صورة الخلفية وحفظها بنجاح."
      );
    } catch (error) {
      console.error(
        "Failed to upload Hero background:",
        error
      );

      setMessage(
        "حدث خطأ أثناء رفع صورة الخلفية. تأكد من إعداد Storage."
      );
    } finally {
      setUploadingBackground(false);
    }
  }


  async function handleGalleryImagesUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0 || !settings) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 10 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setMessage("يرجى اختيار صور PNG أو JPG أو WEBP فقط.");
        return;
      }

      if (file.size > maxSize) {
        setMessage("حجم كل صورة يجب ألا يتجاوز 10 ميجابايت.");
        return;
      }
    }

    const currentImages = Array.isArray(settings.gallery_images)
      ? settings.gallery_images.filter(Boolean)
      : [];

    const currentVisibility = Array.isArray(
      settings.gallery_images_visible
    )
      ? currentImages.map(
          (_, index) =>
            settings.gallery_images_visible?.[index] !== false
        )
      : currentImages.map(() => true);

    const remainingSlots =
      MAX_GALLERY_IMAGES - currentImages.length;

    if (remainingSlots <= 0) {
      setMessage(`المعرض وصل إلى الحد الأقصى وهو ${MAX_GALLERY_IMAGES} صورة.`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      setMessage(
        `تم اختيار ${files.length} صورة، لكن يمكن إضافة ${remainingSlots} صورة فقط لأن الحد الأقصى ${MAX_GALLERY_IMAGES} صورة.`
      );
    } else {
      setMessage("");
    }

    setUploadingGallery(true);

    try {
      let uploadedCount = 0;

      for (const file of filesToUpload) {
        const extension =
          file.type === "image/png"
            ? "png"
            : file.type === "image/webp"
              ? "webp"
              : "jpg";

        const filePath =
          `gallery-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("site-assets")
          .getPublicUrl(filePath);

        const publicUrl = publicData.publicUrl;

        if (!publicUrl) {
          throw new Error("تعذر إنشاء رابط صورة المعرض.");
        }

        currentImages.push(publicUrl);
        currentVisibility.push(true);
        uploadedCount += 1;
      }

      const updated = await updateSiteControl({
        gallery_images: currentImages,
        gallery_images_visible: currentVisibility,
      });

      setSettings(updated);
      setMessage(
        `تم رفع ${uploadedCount} صورة. إجمالي صور المعرض الآن ${currentImages.length} صورة.`
      );
    } catch (error) {
      console.error("Failed to upload gallery images:", error);
      setMessage("حدث خطأ أثناء رفع الصور. تأكد من إعداد Storage.");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handleGalleryVisibilityToggle(index: number) {
    if (!settings) return;

    const images = Array.isArray(settings.gallery_images)
      ? settings.gallery_images.filter(Boolean)
      : [];

    const visibility = Array.isArray(
      settings.gallery_images_visible
    )
      ? images.map(
          (_, itemIndex) =>
            settings.gallery_images_visible?.[itemIndex] !== false
        )
      : images.map(() => true);

    if (!images[index]) return;

    visibility[index] = !visibility[index];

    try {
      const updated = await updateSiteControl({
        gallery_images_visible: visibility,
      });

      setSettings(updated);
    } catch (error) {
      console.error("Failed to toggle gallery visibility:", error);
      setMessage("حدث خطأ أثناء تغيير حالة ظهور الصورة.");
    }
  }

  async function handleGalleryImageDelete(index: number) {
    if (!settings) return;

    const images = Array.isArray(settings.gallery_images)
      ? settings.gallery_images.filter(Boolean)
      : [];

    const imageUrl = images[index] || "";

    const visibility = Array.isArray(
      settings.gallery_images_visible
    )
      ? images.map(
          (_, itemIndex) =>
            settings.gallery_images_visible?.[itemIndex] !== false
        )
      : images.map(() => true);

    if (!imageUrl) return;

    images.splice(index, 1);
    visibility.splice(index, 1);

    try {
      const updated = await updateSiteControl({
        gallery_images: images,
        gallery_images_visible: visibility,
      });

      setSettings(updated);

      const marker = "/storage/v1/object/public/site-assets/";

      if (imageUrl.includes(marker)) {
        const storagePath = imageUrl
          .split(marker)[1]
          ?.split("?")[0];

        if (storagePath) {
          const { error: removeError } =
            await supabase.storage
              .from("site-assets")
              .remove([storagePath]);

          if (removeError) {
            console.warn(
              "Gallery storage delete warning:",
              removeError
            );
          }
        }
      }

      setMessage("تم حذف الصورة من المعرض بنجاح.");
    } catch (error) {
      console.error("Failed to delete gallery image:", error);
      setMessage("حدث خطأ أثناء حذف صورة المعرض.");
    }
  }

  async function moveGalleryImage(
    index: number,
    direction: "up" | "down"
  ) {
    if (!settings) return;

    const images = Array.isArray(settings.gallery_images)
      ? settings.gallery_images.filter(Boolean)
      : [];

    const visibility = Array.isArray(
      settings.gallery_images_visible
    )
      ? images.map(
          (_, itemIndex) =>
            settings.gallery_images_visible?.[itemIndex] !== false
        )
      : images.map(() => true);

    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      index < 0 ||
      index >= images.length ||
      targetIndex < 0 ||
      targetIndex >= images.length
    ) {
      return;
    }

    [images[index], images[targetIndex]] = [
      images[targetIndex],
      images[index],
    ];

    [visibility[index], visibility[targetIndex]] = [
      visibility[targetIndex],
      visibility[index],
    ];

    try {
      const updated = await updateSiteControl({
        gallery_images: images,
        gallery_images_visible: visibility,
      });

      setSettings(updated);
    } catch (error) {
      console.error("Failed to reorder gallery images:", error);
      setMessage("حدث خطأ أثناء ترتيب صور المعرض.");
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

  const typography: SiteTypography = {
    ...defaultTypography,
    ...(settings.typography || {}),
  };

  function updateTypographySize(
    key: keyof SiteTypography,
    device: "desktop" | "mobile",
    value: number
  ) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      const currentTypography: SiteTypography = {
        ...defaultTypography,
        ...(current.typography || {}),
      };

      return {
        ...current,
        typography: {
          ...currentTypography,
          [key]: {
            ...currentTypography[key],
            [device]: Math.max(8, Math.min(120, Number.isFinite(value) ? value : 8)),
          },
        },
      };
    });
  }

  function resetTypographySize(
    key: keyof SiteTypography
  ) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      const currentTypography: SiteTypography = {
        ...defaultTypography,
        ...(current.typography || {}),
      };

      return {
        ...current,
        typography: {
          ...currentTypography,
          [key]: { ...defaultTypography[key] },
        },
      };
    });
  }

  function toggleFeaturedProduct(id: string) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      const currentIds = Array.isArray(
        current.featured_product_ids
      )
        ? current.featured_product_ids.map(String)
        : [];

      const exists = currentIds.includes(id);

      const nextIds = exists
        ? currentIds.filter((itemId) => itemId !== id)
        : [...currentIds, id];

      return {
        ...current,
        featured_product_ids: nextIds,
      };
    });
  }

  function clearFeaturedProducts() {
    updateField("featured_product_ids", []);
  }

  const selectedFeaturedIds = new Set(
    (settings?.featured_product_ids || []).map(String)
  );

  const filteredFeaturedOptions =
    featuredOptions.filter((product) => {
      const query = featuredSearch.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(query) ||
        product.categoryName
          .toLowerCase()
          .includes(query)
      );
    });

  async function saveTypography() {
    if (!settings) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const typographyToSave: SiteTypography = {
        ...defaultTypography,
        ...(settings.typography || {}),
      };

      const response = await fetch(
        "/api/admin/site-control/typography",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            typography: typographyToSave,
          }),
        }
      );

      const responseText = await response.text();

      let result: {
        ok?: boolean;
        error?: string;
        data?: SiteControl;
      } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = {
            error: responseText,
          };
        }
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            `فشل حفظ حجم الخط (${response.status})`
        );
      }

      if (result.data) {
        setSettings(result.data);
      } else {
        setSettings((current) =>
          current
            ? {
                ...current,
                typography: typographyToSave,
              }
            : current
        );
      }

      setMessage("تم حفظ حجم الخط بنجاح.");
    } catch (error) {
      console.error(
        "Failed to save typography:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حفظ حجم الخط."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <TypographyEditorContext.Provider
      value={{
        typography,
        updateSize: updateTypographySize,
        resetSize: resetTypographySize,
        saveTypography,
        savingTypography: saving,
      }}
    >
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
            fontKey="navbar_site_name"
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
            fontKey="hero_title"
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
            fontKey="hero_subtitle"
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
            fontKey="hero_description"
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
            <div className="space-y-5">

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-bold text-zinc-300">
                    معاينة الخلفية
                  </p>

                  <span className="text-xs text-zinc-600">
                    PNG / JPG / WEBP
                  </span>
                </div>

                <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-[#050505]">
                  {settings.hero_background_url ? (
                    <img
                      src={settings.hero_background_url}
                      alt="خلفية الصفحة الرئيسية"
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex min-h-[220px] items-center justify-center text-center text-zinc-600">
                      <div>
                        <ImageIcon
                          size={48}
                          className="mx-auto mb-3"
                        />
                        <p>
                          لم يتم رفع صورة خلفية بعد
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <label
                className={[
                  "flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 font-black text-yellow-400 transition",
                  uploadingBackground
                    ? "cursor-wait opacity-60"
                    : "hover:bg-yellow-500 hover:text-black",
                ].join(" ")}
              >
                {uploadingBackground ? (
                  <>
                    <LoaderCircle
                      size={22}
                      className="animate-spin"
                    />
                    جارٍ رفع الخلفية...
                  </>
                ) : (
                  <>
                    <Upload size={22} />
                    تحميل صورة خلفية جديدة
                  </>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingBackground}
                  onChange={
                    handleHeroBackgroundUpload
                  }
                />
              </label>

              <p className="text-xs leading-6 text-zinc-600">
                اختر صورة الخلفية من جهازك.
                الحد الأقصى 10 ميجابايت.
                سيتم رفع الصورة وحفظها تلقائيًا.
              </p>

            </div>
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
            fontKey="featured_title"
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
            fontKey="featured_description"
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
            title="اختيار المنتجات"
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
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-white">
                    اختر المنتجات التي تريد ظهورها في الصفحة الرئيسية
                  </p>

                  <p className="mt-1 text-xs leading-6 text-zinc-500">
                    عند تحديد منتجات يدويًا سيتم عرض هذه المنتجات تحديدًا.
                    إذا لم تحدد أي منتج، سيعود الموقع إلى نظام المنتجات المميزة القديم.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-black text-yellow-400">
                    مختار: {selectedFeaturedIds.size}
                  </span>

                  {selectedFeaturedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={clearFeaturedProducts}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-400 transition hover:border-red-500/30 hover:text-red-400"
                    >
                      مسح الاختيار
                    </button>
                  )}
                </div>
              </div>

              <input
                value={featuredSearch}
                onChange={(event) =>
                  setFeaturedSearch(event.target.value)
                }
                placeholder="ابحث باسم المنتج أو القسم..."
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
              />

              {featuredLoading ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  جاري تحميل المنتجات...
                </div>
              ) : filteredFeaturedOptions.length > 0 ? (
                <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                  {filteredFeaturedOptions.map((product) => {
                    const selected =
                      selectedFeaturedIds.has(product.id);

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          toggleFeaturedProduct(product.id)
                        }
                        className={[
                          "flex items-center gap-3 rounded-2xl border p-3 text-right transition",
                          selected
                            ? "border-yellow-500/60 bg-yellow-500/10"
                            : "border-white/10 bg-black/20 hover:border-yellow-500/30",
                        ].join(" ")}
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">
                              ☕
                            </div>
                          )}

                          <div
                            className={[
                              "absolute inset-0 flex items-center justify-center bg-black/35 transition",
                              selected
                                ? "opacity-100"
                                : "opacity-0",
                            ].join(" ")}
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-sm font-black text-black">
                              ✓
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate font-black text-white">
                            {product.name}
                          </div>

                          <div className="mt-1 truncate text-xs text-zinc-500">
                            {product.categoryName}
                          </div>

                          <div className="mt-1 text-xs font-bold text-yellow-400">
                            {product.price} ر.س
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  لا توجد منتجات مطابقة للبحث.
                </div>
              )}

              <Input
                label="عدد المنتجات عند عدم اختيار منتجات يدويًا"
                type="number"
                value={String(settings.featured_limit)}
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
            </div>
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
            fontKey="why_title"
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
            fontKey="why_description"
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
            fontKey="matches_title"
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
            fontKey="matches_description"
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

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 lg:col-span-2">
            <div className="mb-5">
              <h3 className="font-black text-white">
                أحجام نصوص المباريات
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                تحكم في حجم التاريخ والوقت والبطولة وأسماء الفرق والعداد.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  key: "matches_date" as const,
                  label: "التاريخ",
                },
                {
                  key: "matches_time" as const,
                  label: "وقت المباراة",
                },
                {
                  key: "matches_competition" as const,
                  label: "اسم البطولة",
                },
                {
                  key: "matches_team_name" as const,
                  label: "أسماء الفرق",
                },
                {
                  key: "matches_countdown" as const,
                  label: "العداد التنازلي",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <span className="text-sm font-bold text-zinc-300">
                    {item.label}
                  </span>

                  <FontSizeButton
                    fontKey={item.key}
                  />
                </div>
              ))}
            </div>
          </div>

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
            fontKey="gallery_title"
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
            fontKey="gallery_description"
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

          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-white">
                  إدارة صور المعرض
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  يمكنك رفع حتى 100 صورة. أول 6 صور في الترتيب هي التي تظهر في الصفحة الرئيسية.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-yellow-500/10 px-3 py-2 text-xs font-black text-yellow-400">
                  {Array.isArray(settings.gallery_images)
                    ? settings.gallery_images.filter(Boolean).length
                    : 0}{" "}
                  / {MAX_GALLERY_IMAGES}
                </span>

                <label
                  className={[
                    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition",
                    uploadingGallery
                      ? "cursor-wait bg-white/5 text-zinc-500"
                      : "bg-yellow-500 text-black hover:bg-yellow-400",
                  ].join(" ")}
                >
                  {uploadingGallery ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      جارٍ رفع الصور...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      تحميل صور من الكمبيوتر
                    </>
                  )}

                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={uploadingGallery}
                    onChange={handleGalleryImagesUpload}
                  />
                </label>
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-4 text-sm leading-7 text-zinc-400">
              <span className="font-black text-yellow-400">
                ⭐ صور الصفحة الرئيسية:
              </span>{" "}
              أول 6 صور حسب الترتيب الحالي. استخدم أزرار الأعلى والأسفل لتغيير
              الصور التي تظهر في الصفحة الرئيسية.
            </div>

            {Array.isArray(settings.gallery_images) &&
            settings.gallery_images.filter(Boolean).length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {settings.gallery_images
                  .filter(Boolean)
                  .map((imageUrl, index) => {
                    const isVisible =
                      Array.isArray(settings.gallery_images_visible)
                        ? settings.gallery_images_visible[index] !== false
                        : true;

                    const isHomeImage = index < 6;

                    return (
                      <div
                        key={`${imageUrl}-${index}`}
                        className={[
                          "overflow-hidden rounded-2xl border bg-black/30",
                          isHomeImage
                            ? "border-yellow-500/40"
                            : "border-white/10",
                        ].join(" ")}
                      >
                        <div className="relative h-48 overflow-hidden bg-[#050505]">
                          <img
                            src={imageUrl}
                            alt={`صورة المعرض ${index + 1}`}
                            className={[
                              "h-full w-full object-cover transition",
                              !isVisible && "opacity-40 grayscale",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          />

                          <div className="absolute right-3 top-3 flex items-center gap-2">
                            <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-black text-white">
                              الصورة {index + 1}
                            </span>

                            {isHomeImage && (
                              <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-black text-black">
                                ⭐ الرئيسية
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() =>
                              moveGalleryImage(index, "up")
                            }
                            className="rounded-lg bg-white/5 px-3 py-2 text-xs font-black text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↑ الأعلى
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              settings.gallery_images.filter(Boolean).length - 1
                            }
                            onClick={() =>
                              moveGalleryImage(index, "down")
                            }
                            className="rounded-lg bg-white/5 px-3 py-2 text-xs font-black text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↓ الأسفل
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleGalleryVisibilityToggle(index)
                            }
                            className={[
                              "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition",
                              isVisible
                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                : "bg-red-500/10 text-red-400 hover:bg-red-500/20",
                            ].join(" ")}
                          >
                            {isVisible ? (
                              <>
                                <Eye size={16} />
                                إخفاء
                              </>
                            ) : (
                              <>
                                <EyeOff size={16} />
                                إظهار
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleGalleryImageDelete(index)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-black text-red-400 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                            حذف
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-600">
                <ImageIcon size={44} className="mx-auto mb-3" />
                <p className="font-bold">
                  لا توجد صور في المعرض حاليًا
                </p>
                <p className="mt-1 text-xs">
                  استخدم زر تحميل صور من الكمبيوتر لإضافة الصور.
                </p>
              </div>
            )}
          </div>

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
            fontKey="testimonials_title"
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
            fontKey="testimonials_description"
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
            fontKey="contact_title"
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
            fontKey="contact_description"
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
            fontKey="footer_text"
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
        description="تحكم كامل في هوية ألوان الموقع مع معاينة فورية."
        icon={<Palette size={22} />}
      >
        <div className="grid gap-5 lg:grid-cols-3">

          <ColorField
            label="اللون الرئيسي"
            description="الأزرار، العناصر الذهبية، والعناصر البارزة."
            value={settings.primary_color}
            defaultValue={DEFAULT_SITE_COLORS.primary}
            onChange={(v) =>
              updateField(
                "primary_color",
                v
              )
            }
          />

          <ColorField
            label="خلفية الموقع"
            description="الخلفية الأساسية للصفحات والأقسام."
            value={settings.background_color}
            defaultValue={DEFAULT_SITE_COLORS.background}
            onChange={(v) =>
              updateField(
                "background_color",
                v
              )
            }
          />

          <ColorField
            label="خلفية البطاقات"
            description="خلفيات البطاقات والنوافذ والأقسام الداخلية."
            value={settings.surface_color}
            defaultValue={DEFAULT_SITE_COLORS.surface}
            onChange={(v) =>
              updateField(
                "surface_color",
                v
              )
            }
          />

        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-black text-white">معاينة الألوان</h3>
              <p className="mt-1 text-sm text-zinc-500">
                هذه المعاينة للتأكد من الألوان قبل الضغط على حفظ جميع التغييرات.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updateField(
                  "primary_color",
                  DEFAULT_SITE_COLORS.primary
                );
                updateField(
                  "background_color",
                  DEFAULT_SITE_COLORS.background
                );
                updateField(
                  "surface_color",
                  DEFAULT_SITE_COLORS.surface
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm font-black text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-400"
            >
              <RotateCcw size={16} />
              استعادة ألوان الموقع
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div
              className="rounded-2xl border border-white/10 p-4"
              style={{
                backgroundColor: normalizeHexColor(
                  settings.background_color,
                  DEFAULT_SITE_COLORS.background
                ),
              }}
            >
              <div className="rounded-xl border border-white/10 p-4" style={{
                backgroundColor: normalizeHexColor(
                  settings.surface_color,
                  DEFAULT_SITE_COLORS.surface
                ),
              }}>
                <div
                  className="mb-3 h-3 w-24 rounded-full"
                  style={{
                    backgroundColor: normalizeHexColor(
                      settings.primary_color,
                      DEFAULT_SITE_COLORS.primary
                    ),
                  }}
                />
                <div className="h-2 w-full rounded-full bg-white/10" />
              </div>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: normalizeHexColor(
                  settings.primary_color,
                  DEFAULT_SITE_COLORS.primary
                ),
                color: normalizeHexColor(
                  settings.background_color,
                  DEFAULT_SITE_COLORS.background
                ),
              }}
            >
              <div className="text-sm font-black">عنصر رئيسي</div>
              <div className="mt-2 text-xs opacity-80">
                معاينة للون الأساسي
              </div>
            </div>

            <div
              className="rounded-2xl border border-white/10 p-4"
              style={{
                backgroundColor: normalizeHexColor(
                  settings.surface_color,
                  DEFAULT_SITE_COLORS.surface
                ),
              }}
            >
              <div className="text-sm font-black text-white">بطاقة</div>
              <div className="mt-2 text-xs text-zinc-400">
                معاينة خلفية البطاقات
              </div>
            </div>
          </div>
        </div>
      </Section>

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
    </TypographyEditorContext.Provider>
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
  fontKey,
}: {
  title: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  fontKey?: keyof SiteTypography;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <h3 className="font-black text-white">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          {fontKey && (
            <FontSizeButton fontKey={fontKey} />
          )}

          <VisibilityButton
            enabled={enabled}
            onToggle={onToggle}
          />
        </div>

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
   FontSizeButton
========================================================= */

function FontSizeButton({
  fontKey,
}: {
  fontKey: keyof SiteTypography;
}) {
  const {
    typography,
    updateSize,
    resetSize,
    saveTypography,
    savingTypography,
  } = useTypographyEditor();

  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const current = typography[fontKey];

  function updatePanelPosition() {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const panelWidth = 320;
    const gap = 8;
    const viewportPadding = 12;

    let left = rect.right - panelWidth;

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    if (left + panelWidth > window.innerWidth - viewportPadding) {
      left = Math.max(
        viewportPadding,
        window.innerWidth - panelWidth - viewportPadding
      );
    }

    let top = rect.bottom + gap;

    const estimatedPanelHeight = 310;

    if (
      top + estimatedPanelHeight >
      window.innerHeight - viewportPadding
    ) {
      const aboveTop = rect.top - estimatedPanelHeight - gap;

      if (aboveTop >= viewportPadding) {
        top = aboveTop;
      } else {
        top = Math.max(
          viewportPadding,
          window.innerHeight - estimatedPanelHeight - viewportPadding
        );
      }
    }

    setPanelPosition({
      top,
      left,
    });
  }

  function toggleOpen() {
    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      updatePanelPosition();
    });

    const handleViewportChange = () => {
      updatePanelPosition();
    };

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        handleViewportChange
      );

      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, [open]);

  async function handleSave() {
    await saveTypography();
    setOpen(false);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        title="التحكم في حجم الخط"
        className={[
          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition",
          open
            ? "border-yellow-500/50 bg-yellow-500/15 text-yellow-400"
            : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-yellow-500/30 hover:text-yellow-400",
        ].join(" ")}
      >
        <span className="text-sm font-black">
          Aa
        </span>

        <span>
          {current.desktop}px
        </span>
      </button>

      {open && panelPosition && (
        <div
          ref={panelRef}
          dir="rtl"
          className="fixed z-[9999] w-[min(320px,calc(100vw-24px))] rounded-2xl border border-yellow-500/20 bg-[#101010] p-4 shadow-2xl shadow-black/50"
          style={{
            top: panelPosition.top,
            left: panelPosition.left,
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-white">
                حجم الخط
              </p>

              <p className="mt-1 text-[11px] text-zinc-500">
                إعداد مستقل لهذا النص
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                resetSize(fontKey)
              }
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-zinc-400 transition hover:border-yellow-500/30 hover:text-yellow-400"
            >
              <RotateCcw size={13} />
              افتراضي
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="rounded-xl border border-white/10 bg-black/30 p-3">
              <span className="mb-2 block text-[11px] font-bold text-zinc-400">
                كمبيوتر
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={current.desktop}
                  onChange={(event) =>
                    updateSize(
                      fontKey,
                      "desktop",
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-black px-2.5 py-2 text-sm font-bold text-white outline-none focus:border-yellow-500"
                />

                <span className="text-[11px] font-bold text-zinc-600">
                  px
                </span>
              </div>
            </label>

            <label className="rounded-xl border border-white/10 bg-black/30 p-3">
              <span className="mb-2 block text-[11px] font-bold text-zinc-400">
                جوال
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={current.mobile}
                  onChange={(event) =>
                    updateSize(
                      fontKey,
                      "mobile",
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-black px-2.5 py-2 text-sm font-bold text-white outline-none focus:border-yellow-500"
                />

                <span className="text-[11px] font-bold text-zinc-600">
                  px
                </span>
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={savingTypography}
            className="mt-4 w-full rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-black text-black transition hover:bg-yellow-400 disabled:opacity-60"
          >
            {savingTypography
              ? "جارٍ الحفظ..."
              : "حفظ حجم الخط"}
          </button>
        </div>
      )}
    </>
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
  description,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  defaultValue: string;
  onChange: (value: string) => void;
}) {
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value.trim());
  const safeValue = isValid ? value.trim().toUpperCase() : defaultValue;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-4">
        <label className="block text-sm font-black text-white">
          {label}
        </label>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-14 w-16 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-black p-1"
          aria-label={`اختيار ${label}`}
        />

        <div className="min-w-0 flex-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder={defaultValue}
            inputMode="text"
            spellCheck={false}
            className={[
              "w-full rounded-xl border bg-black px-4 py-3 font-mono text-sm text-white uppercase outline-none transition",
              isValid
                ? "border-white/10 focus:border-yellow-500"
                : "border-red-500/50 focus:border-red-400",
            ].join(" ")}
            aria-invalid={!isValid}
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={isValid ? "text-xs text-green-400" : "text-xs text-red-400"}>
              {isValid ? safeValue : "صيغة اللون يجب أن تكون #RRGGBB"}
            </span>

            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              className="text-xs font-bold text-zinc-500 transition hover:text-yellow-400"
            >
              افتراضي
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "#EAB308",
          "#F59E0B",
          "#D4AF37",
          "#111111",
          "#0A0A0A",
          "#121212",
          "#1C1C1C",
          "#FFFFFF",
        ].map((preset) => (
          <button
            key={preset}
            type="button"
            title={preset}
            onClick={() => onChange(preset)}
            className="h-7 w-7 rounded-full border border-white/20 shadow-sm transition hover:scale-110"
            style={{ backgroundColor: preset }}
            aria-label={`اختيار اللون ${preset}`}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Typography Settings
========================================================= */