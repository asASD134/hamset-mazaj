"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Coffee,
  Phone,
  MapPin,
  Clock3,
  ExternalLink,
} from "lucide-react";

import SiteName from "@/components/SiteName";
import { useCafeSettings } from "@/context/CafeSettingsContext";
import { useSiteControl } from "@/context/SiteControlContext";

import {
  getSocialLinks,
  type SocialLink,
} from "@/services/socialLinks";

export default function Footer() {
  const year = new Date().getFullYear();

  const { settings } =
    useCafeSettings();

  const siteControl =
    useSiteControl();

  const [socialLinks, setSocialLinks] =
    useState<SocialLink[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadSocialLinks() {
      try {
        const data =
          await getSocialLinks();

        if (mounted) {
          setSocialLinks(data);
        }
      } catch (error) {
        console.error(
          "Failed to load footer social links:",
          error
        );

        if (mounted) {
          setSocialLinks([]);
        }
      }
    }

    loadSocialLinks();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * إخفاء Footer بالكامل
   */
  if (
    siteControl?.footer_enabled === false
  ) {
    return null;
  }

  const showDescription =
    siteControl?.show_footer_description !==
    false;

  const showLinks =
    siteControl?.show_footer_links !==
    false;

  const showContact =
    siteControl?.show_footer_contact !==
    false;

  const showSocial =
    siteControl?.show_footer_social_links !==
    false;

  const showCopyright =
    siteControl?.show_footer_copyright !==
    false;

  const phone =
    settings.phone ||
    "0594165122";

  const address =
    settings.address ||
    "الدمام - حي النهضة - مجمع 55 - بجوار صيدلية الدواء";

  const openingHours =
    settings.opening_hours ||
    "مفتوح 24 ساعة";

  const description =
    siteControl?.footer_description ||
    settings.description ||
    "تجربة راقية تجمع بين القهوة، المشروبات، الحلويات، الشيشة والجلسات المميزة.";

  const activeSocialLinks =
    socialLinks.filter(
      (link) => link.is_active
    );

  return (
    <footer
      dir="rtl"
      className="border-t border-yellow-500/10 bg-[#050505]"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* =========================================
              تعريف المقهى
          ========================================= */}

          {showDescription && (
            <div>

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black">
                  <Coffee size={25} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-yellow-400">
                    <SiteName />
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Coffee & Lounge
                  </p>
                </div>

              </div>

              <p className="max-w-sm leading-8 text-zinc-400">
                {description}
              </p>

            </div>
          )}

          {/* =========================================
              الروابط
          ========================================= */}

          {showLinks && (
            <div>

              <h3 className="mb-5 text-lg font-black text-white">
                روابط سريعة
              </h3>

              <nav className="space-y-3">

                <Link
                  href="/"
                  className="block text-zinc-400 transition hover:text-yellow-400"
                >
                  الرئيسية
                </Link>

                <Link
                  href="/menu"
                  className="block text-zinc-400 transition hover:text-yellow-400"
                >
                  المنيو
                </Link>

                <Link
                  href="/gallery"
                  className="block text-zinc-400 transition hover:text-yellow-400"
                >
                  المعرض
                </Link>

                <Link
                  href="/matches"
                  className="block text-zinc-400 transition hover:text-yellow-400"
                >
                  المباريات
                </Link>

                <Link
                  href="/contact"
                  className="block text-zinc-400 transition hover:text-yellow-400"
                >
                  تواصل معنا
                </Link>

              </nav>

            </div>
          )}

          {/* =========================================
              التواصل
          ========================================= */}

          {showContact && (
            <div>

              <h3 className="mb-5 text-lg font-black text-white">
                معلومات التواصل
              </h3>

              <div className="space-y-5">

                <div className="flex items-start gap-3">
                  <Phone
                    size={19}
                    className="mt-1 shrink-0 text-yellow-400"
                  />

                  <a
                    href={`tel:${phone}`}
                    className="leading-7 text-zinc-400 transition hover:text-yellow-400"
                  >
                    {phone}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    size={19}
                    className="mt-1 shrink-0 text-yellow-400"
                  />

                  <span className="leading-7 text-zinc-400">
                    {address}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3
                    size={19}
                    className="mt-1 shrink-0 text-yellow-400"
                  />

                  <span className="leading-7 text-zinc-400">
                    {openingHours}
                  </span>
                </div>

              </div>

            </div>
          )}

          {/* =========================================
              مواقع التواصل
          ========================================= */}

          {showSocial && (
            <div>

              <h3 className="mb-5 text-lg font-black text-white">
                تابعونا
              </h3>

              <p className="mb-5 leading-7 text-zinc-500">
                جميع حساباتنا وروابطنا الرسمية.
              </p>

              {activeSocialLinks.length >
              0 ? (
                <div className="flex flex-wrap gap-2.5">

                  {activeSocialLinks.map(
                    (social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-bold text-zinc-300 transition-all duration-300 hover:border-yellow-500/30 hover:bg-yellow-500 hover:text-black"
                      >

                        <span className="text-lg">
                          {social.icon ||
                            "🔗"}
                        </span>

                        <span>
                          {social.name}
                        </span>

                        <ExternalLink
                          size={13}
                          className="opacity-50 transition group-hover:opacity-100"
                        />

                      </a>
                    )
                  )}

                </div>
              ) : (
                <p className="text-sm text-zinc-600">
                  لا توجد مواقع تواصل مضافة حاليًا.
                </p>
              )}

            </div>
          )}

        </div>

        {/* =========================================
            حقوق النشر
        ========================================= */}

        {showCopyright && (
          <div className="mt-12 border-t border-white/10 pt-7">

            <div className="flex flex-col items-center justify-between gap-3 text-center text-sm text-zinc-600 md:flex-row md:text-right">

              <p>
                © {year}{" "}
                <SiteName />{" "}
                — جميع الحقوق محفوظة.
              </p>

              <p>
                تجربة قهوة ومزاج تستحق التكرار.
              </p>

            </div>

          </div>
        )}

      </div>
    </footer>
  );
}