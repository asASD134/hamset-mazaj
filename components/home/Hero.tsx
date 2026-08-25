"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ShoppingBag,
} from "lucide-react";

import { useTable } from "@/context/TableContext";
import { useSiteControl } from "@/context/SiteControlContext";

export default function Hero() {
  const { hasTable, tableNumber } = useTable();
  const siteControl = useSiteControl();

  const withTable = (path: string) =>
    hasTable
      ? `${path}?table=${tableNumber}`
      : path;

  /* =========================================
     الهوية
  ========================================= */

  const cafeName =
    siteControl?.site_name ||
    "همسة مزاج";

  const heroTitle =
    siteControl?.hero_title ||
    "مرحبًا بكم في همسة مزاج";

  const heroSubtitle =
    siteControl?.hero_subtitle ||
    "أجواء راقية... ومزاج على كيفك";

  const heroDescription =
    siteControl?.hero_description ||
    "تجربة راقية تجمع بين القهوة والمشروبات والجلسات المميزة.";

  const badge =
    siteControl?.hero_badge ||
    "COFFEE • LOUNGE • MOMENTS";

  const logoUrl =
    siteControl?.logo_url ||
    "/images/logo.png";

  const backgroundUrl =
    siteControl?.hero_background_url ||
    "/images/cafe.jpg";

  const primaryText =
    siteControl?.hero_primary_text ||
    "تصفح المنيو";

  const primaryUrl =
    siteControl?.hero_primary_url ||
    "/menu";

  const secondaryText =
    siteControl?.hero_secondary_text ||
    "موقعنا وتواصل معنا";

  const secondaryUrl =
    siteControl?.hero_secondary_url ||
    "/contact";

  /* =========================================
     الألوان
  ========================================= */

  const primaryColor =
    siteControl?.primary_color ||
    "#EAB308";

  const backgroundColor =
    siteControl?.background_color ||
    "#0A0A0A";

  const surfaceColor =
    siteControl?.surface_color ||
    "#121212";

  /* =========================================
     إظهار / إخفاء
  ========================================= */

  const showLogo =
    siteControl?.show_logo !== false;

  const showBadge =
    siteControl?.show_hero_badge !== false;

  const showTitle =
    siteControl?.show_hero_title !== false;

  const showSubtitle =
    siteControl?.show_hero_subtitle !== false;

  const showDescription =
    siteControl?.show_hero_description !== false;

  const showBackground =
    siteControl?.show_hero_background !== false;

  const showPrimaryButton =
    siteControl?.show_hero_primary_button !== false;

  const showSecondaryButton =
    siteControl?.show_hero_secondary_button !== false;

  /* =========================================
     أحجام الخطوط
  ========================================= */

  const typography =
    siteControl?.typography;

  const heroTitleDesktop =
    typography?.hero_title?.desktop ??
    64;

  const heroTitleMobile =
    typography?.hero_title?.mobile ??
    42;

  const heroSubtitleDesktop =
    typography?.hero_subtitle?.desktop ??
    30;

  const heroSubtitleMobile =
    typography?.hero_subtitle?.mobile ??
    22;

  const heroDescriptionDesktop =
    typography?.hero_description?.desktop ??
    20;

  const heroDescriptionMobile =
    typography?.hero_description?.mobile ??
    16;

  /* =========================================
     التشغيل / الإيقاف
  ========================================= */

  if (
    siteControl?.hero_enabled === false
  ) {
    return null;
  }

  return (
    <section
      dir="rtl"
      className="relative min-h-[calc(100vh-96px)] overflow-hidden"
      style={{
        backgroundColor,
      }}
    >
      {/* =========================================
          الخلفية
      ========================================= */}

      {showBackground ? (
        <Image
          src={backgroundUrl}
          alt={`مقهى ${cafeName}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor,
          }}
        />
      )}

      {/* =========================================
          طبقة التعتيم
      ========================================= */}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.82), rgba(0,0,0,0.64), rgba(0,0,0,0.92))",
        }}
      />

      {/* =========================================
          تأثير اللون الرئيسي
      ========================================= */}

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            circle at center,
            ${primaryColor}20,
            transparent 42%
          )`,
        }}
      />

      {/* =========================================
          التدرج السفلي
      ========================================= */}

      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.82), transparent)",
        }}
      />

      {/* =========================================
          المحتوى
      ========================================= */}

      <div className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-5xl text-center">

          {/* =========================================
              الشعار
          ========================================= */}

          {showLogo && (
            <div
              className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full p-4 shadow-2xl backdrop-blur-md sm:h-36 sm:w-36"
              style={{
                border: `1px solid ${primaryColor}55`,
                backgroundColor:
                  "rgba(0,0,0,0.30)",
              }}
            >
              <Image
                src={logoUrl}
                alt={cafeName}
                width={180}
                height={180}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* =========================================
              الشارة
          ========================================= */}

          {showBadge && (
            <div
              className="mx-auto inline-flex items-center rounded-full px-5 py-2 text-xs font-bold tracking-[0.2em] backdrop-blur-md sm:text-sm"
              style={{
                border: `1px solid ${primaryColor}55`,
                backgroundColor:
                  `${primaryColor}18`,
                color: primaryColor,
              }}
            >
              {badge}
            </div>
          )}

          {/* =========================================
              العنوان الرئيسي
          ========================================= */}

          {showTitle && (
            <h1
              className="mt-6 font-black tracking-tight text-white"
              style={{
                fontSize: `clamp(${heroTitleMobile}px, 6vw, ${heroTitleDesktop}px)`,
              }}
            >
              {heroTitle}
            </h1>
          )}

          {/* =========================================
              العنوان المختصر
          ========================================= */}

          {showSubtitle && (
            <p
              className="mx-auto mt-5 max-w-3xl font-bold"
              style={{
                fontSize: `clamp(${heroSubtitleMobile}px, 3vw, ${heroSubtitleDesktop}px)`,
                color: primaryColor,
              }}
            >
              {heroSubtitle}
            </p>
          )}

          {/* =========================================
              الوصف
          ========================================= */}

          {showDescription && (
            <p
              className="mx-auto mt-5 max-w-3xl leading-8 text-zinc-200"
              style={{
                fontSize: `clamp(${heroDescriptionMobile}px, 2vw, ${heroDescriptionDesktop}px)`,
              }}
            >
              {heroDescription}
            </p>
          )}

          {/* =========================================
              رقم الطاولة
          ========================================= */}

          {hasTable && (
            <div
              className="mx-auto mt-7 inline-flex rounded-2xl px-6 py-3 shadow-xl backdrop-blur-md"
              style={{
                border: `1px solid ${primaryColor}55`,
                backgroundColor:
                  "rgba(0,0,0,0.40)",
              }}
            >
              <span
                className="text-lg font-bold"
                style={{
                  color: primaryColor,
                }}
              >
                🪑 الطاولة رقم {tableNumber}
              </span>
            </div>
          )}

          {/* =========================================
              الأزرار
          ========================================= */}

          {(showPrimaryButton ||
            showSecondaryButton) && (
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">

              {/* الزر الأول */}
              {showPrimaryButton && (
                <Link
                  href={withTable(
                    primaryUrl
                  )}
                  className="inline-flex items-center gap-3 rounded-2xl px-7 py-3.5 font-black text-black shadow-xl transition-all duration-300 hover:-translate-y-1 sm:px-9 sm:py-4"
                  style={{
                    backgroundColor:
                      primaryColor,
                    boxShadow: `0 15px 35px ${primaryColor}20`,
                  }}
                >
                  <ShoppingBag size={22} />
                  {primaryText}
                </Link>
              )}

              {/* الزر الثاني */}
              {showSecondaryButton && (
                <Link
                  href={withTable(
                    secondaryUrl
                  )}
                  className="inline-flex items-center gap-3 rounded-2xl border px-7 py-3.5 font-black backdrop-blur-md transition-all duration-300 hover:-translate-y-1 sm:px-9 sm:py-4"
                  style={{
                    borderColor:
                      `${primaryColor}99`,
                    backgroundColor:
                      "rgba(0,0,0,0.30)",
                    color: primaryColor,
                  }}
                >
                  {hasTable ? (
                    <Bell size={22} />
                  ) : (
                    <ArrowLeft size={20} />
                  )}

                  {secondaryText}
                </Link>
              )}
            </div>
          )}

          {/* =========================================
              الإحصائيات
          ========================================= */}

          <div
            className="mx-auto mt-12 grid max-w-3xl grid-cols-3 overflow-hidden rounded-2xl backdrop-blur-md"
            style={{
              border: "1px solid rgba(255,255,255,0.10)",
              backgroundColor:
                "rgba(0,0,0,0.30)",
            }}
          >
            <div
              className="border-l px-3 py-4"
              style={{
                borderColor:
                  "rgba(255,255,255,0.10)",
              }}
            >
              <div
                className="text-xl font-black"
                style={{
                  color: primaryColor,
                }}
              >
                24
              </div>

              <div className="mt-1 text-xs text-zinc-300 sm:text-sm">
                ساعة
              </div>
            </div>

            <div
              className="border-l px-3 py-4"
              style={{
                borderColor:
                  "rgba(255,255,255,0.10)",
              }}
            >
              <div
                className="text-xl font-black"
                style={{
                  color: primaryColor,
                }}
              >
                ☕
              </div>

              <div className="mt-1 text-xs text-zinc-300 sm:text-sm">
                قهوة ومشروبات
              </div>
            </div>

            <div className="px-3 py-4">
              <div
                className="text-xl font-black"
                style={{
                  color: primaryColor,
                }}
              >
                ⚽
              </div>

              <div className="mt-1 text-xs text-zinc-300 sm:text-sm">
                متابعة المباريات
              </div>
            </div>
          </div>

          {/* =========================================
              أسفل Hero
          ========================================= */}

          <div className="mt-10 text-sm text-zinc-400">
            اكتشف أجواء {cafeName}

            <div
              className="mt-2"
              style={{
                color: primaryColor,
              }}
            >
              ↓
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}