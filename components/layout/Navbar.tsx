"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  UtensilsCrossed,
  Trophy,
  Images,
  Phone,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

import { useTable } from "@/context/TableContext";
import { useCafeSettings } from "@/context/CafeSettingsContext";
import { useSiteControl } from "@/context/SiteControlContext";

export default function Navbar() {
  const pathname = usePathname();

  const { hasTable, tableNumber, cafeSlug } =
    useTable();

  const { settings } =
    useCafeSettings();

  const siteControl =
    useSiteControl();

  const [open, setOpen] =
    useState(false);

  const withTable = (path: string) => {
    const params = new URLSearchParams();
    if (cafeSlug) params.set("cafe", cafeSlug);
    if (hasTable) params.set("table", String(tableNumber));
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  };

  /*
   * المصدر الأساسي للاسم والشعار:
   * site_control
   *
   * وإذا لم توجد قيمة نرجع إلى
   * cafe_settings.
   */

  const cafeName =
    siteControl?.site_name ||
    settings.cafe_name ||
    "همسة مزاج";

  const logoUrl =
    siteControl?.logo_url ||
    settings.logo_url ||
    "/images/logo.png";

  const showLogo =
    siteControl?.show_logo !== false;

  const showSiteName =
    siteControl?.show_site_name !== false;

  const navItems = [
    {
      href: "/",
      label: "الرئيسية",
      icon: House,
    },
    {
      href: "/menu",
      label: "المنيو",
      icon: UtensilsCrossed,
    },
    {
      href: "/matches",
      label: "المباريات",
      icon: Trophy,
    },
    {
      href: "/gallery",
      label: "المعرض",
      icon: Images,
    },
    {
      href: "/contact",
      label: "تواصل معنا",
      icon: Phone,
    },
  ];

  const isActive = (
    href: string
  ) =>
    pathname === href ||
    (href !== "/" &&
      pathname.startsWith(href));

  return (
    <>
      {/* =================================================
          Navbar
      ================================================= */}

      <nav
        dir="rtl"
        className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center">

            {/* =================================================
                القائمة اليمنى
            ================================================= */}

            <div className="hidden items-center justify-end gap-1 lg:flex">

              {navItems
                .slice(0, 2)
                .map((item) => {
                  const Icon =
                    item.icon;

                  const active =
                    isActive(
                      item.href
                    );

                  return (
                    <Link
                      key={item.href}
                      href={withTable(
                        item.href
                      )}
                      className={[
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300",
                        active
                          ? "bg-yellow-500 text-black"
                          : "text-zinc-300 hover:bg-white/5 hover:text-yellow-400",
                      ].join(" ")}
                    >
                      <Icon size={17} />

                      {item.label}
                    </Link>
                  );
                })}

            </div>

            {/* =================================================
                الشعار والاسم
            ================================================= */}

            <Link
              href={withTable("/")}
              className="group flex flex-col items-center justify-center"
            >

              {showLogo && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/20 bg-black/40 p-1.5 transition duration-300 group-hover:border-yellow-500/50">

                  <Image
                    src={logoUrl}
                    alt={cafeName}
                    width={64}
                    height={64}
                    priority
                    className="h-full w-full object-contain"
                  />

                </div>
              )}

              {showSiteName && (
                <span className="mt-1 text-sm font-black text-yellow-400 sm:text-base">
                  {cafeName}
                </span>
              )}

              <span className="hidden text-[8px] tracking-[0.35em] text-zinc-500 sm:block">
                COFFEE & LOUNGE
              </span>

            </Link>

            {/* =================================================
                القائمة اليسرى
            ================================================= */}

            <div className="hidden items-center justify-start gap-1 lg:flex">

              {navItems
                .slice(2)
                .map((item) => {
                  const Icon =
                    item.icon;

                  const active =
                    isActive(
                      item.href
                    );

                  return (
                    <Link
                      key={item.href}
                      href={withTable(
                        item.href
                      )}
                      className={[
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300",
                        active
                          ? "bg-yellow-500 text-black"
                          : "text-zinc-300 hover:bg-white/5 hover:text-yellow-400",
                      ].join(" ")}
                    >
                      <Icon size={17} />

                      {item.label}
                    </Link>
                  );
                })}

            </div>

            {/* =================================================
                زر الجوال
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                setOpen(true)
              }
              aria-label="فتح القائمة"
              className="justify-self-end rounded-xl border border-white/10 bg-white/5 p-2.5 text-yellow-400 transition hover:border-yellow-500/30 hover:bg-yellow-500/10 lg:hidden"
            >
              <Menu size={24} />
            </button>

          </div>
        </div>
      </nav>

      {/* =================================================
          القائمة الجانبية للجوال
      ================================================= */}

      <div
        className={[
          "fixed inset-0 z-[60] transition-all duration-300",
          open
            ? "visible bg-black/70 backdrop-blur-sm"
            : "pointer-events-none invisible",
        ].join(" ")}
        onClick={() =>
          setOpen(false)
        }
      >

        <aside
          dir="rtl"
          className={[
            "absolute right-0 top-0 h-full w-[min(88vw,360px)] border-l border-yellow-500/10 bg-[#090909] shadow-2xl transition-transform duration-300",
            open
              ? "translate-x-0"
              : "translate-x-full",
          ].join(" ")}
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          {/* رأس القائمة */}
          <div className="flex items-center justify-between border-b border-white/10 p-5">

            <Link
              href={withTable("/")}
              onClick={() =>
                setOpen(false)
              }
              className="flex items-center gap-3"
            >

              {showLogo && (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black p-1.5">

                  <Image
                    src={logoUrl}
                    alt={cafeName}
                    width={52}
                    height={52}
                    className="h-full w-full object-contain"
                  />

                </div>
              )}

              <div>

                {showSiteName && (
                  <h2 className="font-black text-yellow-400">
                    {cafeName}
                  </h2>
                )}

                <p className="text-[8px] tracking-[0.3em] text-zinc-500">
                  COFFEE & LOUNGE
                </p>

              </div>

            </Link>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="إغلاق القائمة"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:text-yellow-400"
            >
              <X size={20} />
            </button>

          </div>

          {/* روابط الهاتف */}
          <div className="space-y-2 p-5">

            {navItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.href
                  );

                return (
                  <Link
                    key={item.href}
                    href={withTable(
                      item.href
                    )}
                    onClick={() =>
                      setOpen(false)
                    }
                    className={[
                      "flex items-center gap-4 rounded-2xl px-5 py-4 font-bold transition",
                      active
                        ? "bg-yellow-500 text-black"
                        : "text-zinc-200 hover:bg-white/5 hover:text-yellow-400",
                    ].join(" ")}
                  >
                    <Icon size={22} />

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              }
            )}

          </div>
        </aside>
      </div>
    </>
  );
}