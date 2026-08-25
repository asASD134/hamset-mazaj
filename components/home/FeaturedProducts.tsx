"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

import { getMenuCategories } from "@/modules/menu/services/menu.service";
import type { MenuCategory } from "@/modules/menu/types/menu";

import { useTable } from "@/context/TableContext";
import { useSiteControl } from "@/context/SiteControlContext";

export default function FeaturedProducts() {
  const { hasTable, tableNumber } = useTable();
  const siteControl = useSiteControl();

  const [categories, setCategories] =
    useState<MenuCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      try {
        const data =
          await getMenuCategories();

        if (!mounted) {
          return;
        }

        setCategories(data);
      } catch (error) {
        console.error(
          "Failed to load menu:",
          error
        );

        if (mounted) {
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      mounted = false;
    };
  }, []);

  const withTable = (path: string) =>
    hasTable
      ? `${path}?table=${tableNumber}`
      : path;

  if (
    siteControl?.featured_enabled === false
  ) {
    return null;
  }

  const showTitle =
    siteControl?.show_featured_title !== false;

  const showDescription =
    siteControl?.show_featured_description !==
    false;

  const showProducts =
    siteControl?.show_featured_products !==
    false;

  const showBadge =
    siteControl?.show_featured_badge !==
    false;

  const showPrices =
    siteControl?.show_featured_prices !==
    false;

  const showButton =
    siteControl?.show_featured_button !==
    false;

  const limit =
    Number(
      siteControl?.featured_limit
    ) || 6;

  const allProducts = categories.flatMap(
    (category) =>
      category.items || []
  );

  const featuredProducts =
    allProducts.filter(
      (item) => item.featured
    );

  const selectedIds = new Set(
    (siteControl?.featured_product_ids || [])
      .map(String)
  );

  const hasManualSelection =
    selectedIds.size > 0;

  /*
   * عند وجود اختيار يدوي:
   * نعرض المنتجات التي اختارها المدير تحديدًا.
   *
   * عند عدم وجود اختيار يدوي:
   * نستخدم النظام القديم:
   * featured ثم أول المنتجات كحل احتياطي.
   */
  const products = hasManualSelection
    ? allProducts.filter((item) =>
        selectedIds.has(String(item.id))
      )
    : (
        featuredProducts.length > 0
          ? featuredProducts
          : allProducts
      ).slice(0, limit);

  const title =
    siteControl?.featured_title ||
    "منتجاتنا المميزة";

  const description =
    siteControl?.featured_description ||
    "استمتع بأفضل منتجاتنا المختارة بعناية.";

  if (loading) {
    return (
      <section
        dir="rtl"
        className="py-24"
        style={{ backgroundColor: "var(--site-background, #0A0A0A)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <div className="mx-auto h-4 w-32 animate-pulse rounded-full bg-zinc-800" />
            <div className="mx-auto mt-4 h-10 w-72 animate-pulse rounded-xl bg-zinc-900" />
            <div className="mx-auto mt-4 h-5 max-w-2xl animate-pulse rounded-xl bg-zinc-900" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: Math.min(limit, 6),
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
              >
                <div className="h-72 animate-pulse bg-zinc-800" />

                <div className="space-y-4 p-6">
                  <div className="h-7 animate-pulse rounded bg-zinc-800" />
                  <div className="h-12 animate-pulse rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="py-24"
      style={{ backgroundColor: "var(--site-background, #0A0A0A)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {(showTitle ||
          showDescription) && (
          <div className="mb-14 text-center">
            {showTitle && (
              <>
                <span className="font-bold tracking-widest text-yellow-400">
                  الأكثر طلبًا
                </span>

                <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
                  {title}
                </h2>
              </>
            )}

            {showDescription && (
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                {description}
              </p>
            )}
          </div>
        )}

        {showProducts && (
          <>
            {products.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10"
                  >
                    <div className="relative h-72 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-zinc-800 text-5xl">
                          {item.icon || "☕"}
                        </div>
                      )}

                      {showBadge &&
                        item.featured && (
                          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                            <Star
                              size={15}
                              fill="currentColor"
                            />
                            مميز
                          </div>
                        )}
                    </div>

                    <div className="space-y-4 p-6">
                      <h3 className="text-2xl font-bold text-white">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="line-clamp-2 min-h-[48px] text-zinc-400">
                          {item.description}
                        </p>
                      )}

                      {showPrices && (
                        <div className="text-2xl font-black text-yellow-400">
                          {item.price} ر.س
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
                <p className="text-zinc-400">
                  لا توجد منتجات متاحة حاليًا.
                </p>
              </div>
            )}
          </>
        )}

        {showButton && (
          <div className="mt-16 text-center">
            <Link
              href={withTable("/menu")}
              className="inline-flex rounded-2xl border-2 border-yellow-500 px-8 py-4 text-lg font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
            >
              عرض المنيو بالكامل
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}