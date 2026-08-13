"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  UtensilsCrossed,
  Eye,
  EyeOff,
  Star,
  Package,
} from "lucide-react";

import { useMenu } from "@/hooks/useMenu";
import MenuTable from "@/components/admin/menu/MenuTable";

export default function AdminMenuPage() {
  const router = useRouter();

  const {
    items,
    loading,
    toggle,
    remove,
  } = useMenu();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const categories = useMemo(() => {
    const values = items
      .map((item) => item.category)
      .filter(Boolean);

    return Array.from(new Set(values));
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;

    const available = items.filter(
      (item) => item.available
    ).length;

    const hidden = items.filter(
      (item) => !item.available
    ).length;

    const featured = items.filter(
      (item) => item.featured
    ).length;

    return {
      total,
      available,
      hidden,
      featured,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description
          ?.toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "all" ||
        item.category === category;

      const matchesFeatured =
        !featuredOnly || item.featured;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFeatured
      );
    });
  }, [
    items,
    search,
    category,
    featuredOnly,
  ]);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black p-6 text-white"
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 px-8 py-6 text-center shadow-xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

            <p className="text-lg font-bold text-zinc-200">
              جاري تحميل المنيو...
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              يرجى الانتظار
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black p-4 text-white sm:p-6 lg:p-8"
    >
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/10">
                <UtensilsCrossed size={25} />
              </div>

              <div>
                <h1 className="text-3xl font-black text-yellow-400 sm:text-4xl">
                  إدارة المنيو
                </h1>

                <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                  إضافة وتعديل وإدارة منتجات المقهى
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/menu/new")
            }
            className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-3 font-black text-black shadow-lg shadow-yellow-500/10 transition hover:bg-yellow-400 active:scale-[0.98]"
          >
            <Plus size={21} />
            إضافة منتج
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                إجمالي المنتجات
              </p>

              <p className="mt-2 text-3xl font-black text-yellow-400">
                {stats.total}
              </p>
            </div>

            <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                المنتجات المتوفرة
              </p>

              <p className="mt-2 text-3xl font-black text-green-400">
                {stats.available}
              </p>
            </div>

            <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
              <Eye size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                المنتجات المخفية
              </p>

              <p className="mt-2 text-3xl font-black text-red-400">
                {stats.hidden}
              </p>
            </div>

            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <EyeOff size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                المنتجات المميزة
              </p>

              <p className="mt-2 text-3xl font-black text-purple-400">
                {stats.featured}
              </p>
            </div>

            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <Star size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="ابحث عن اسم المنتج أو الوصف..."
              className="w-full rounded-xl border border-zinc-700 bg-black py-3 pr-11 pl-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-500"
          >
            <option value="all">
              جميع التصنيفات
            </option>

            {categories.map((itemCategory) => (
              <option
                key={itemCategory}
                value={itemCategory}
              >
                {itemCategory}
              </option>
            ))}
          </select>

          {/* Featured */}
          <button
            type="button"
            onClick={() =>
              setFeaturedOnly(
                (value) => !value
              )
            }
            className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-bold transition ${
              featuredOnly
                ? "border-yellow-500 bg-yellow-500 text-black"
                : "border-zinc-700 bg-black text-zinc-300 hover:border-yellow-500 hover:text-yellow-400"
            }`}
          >
            <Star
              size={18}
              fill={
                featuredOnly
                  ? "currentColor"
                  : "none"
              }
            />

            المنتجات المميزة فقط
          </button>
        </div>

        {/* Results count */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-4 text-sm">
          <span className="text-zinc-400">
            عرض{" "}
            <span className="font-bold text-white">
              {filteredItems.length}
            </span>{" "}
            من{" "}
            <span className="font-bold text-white">
              {items.length}
            </span>{" "}
            منتج
          </span>

          {(search ||
            category !== "all" ||
            featuredOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setFeaturedOnly(false);
              }}
              className="font-bold text-yellow-400 hover:text-yellow-300"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </section>

      {/* Products */}
      {filteredItems.length === 0 ? (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
            <Package size={30} />
          </div>

          <h2 className="text-xl font-bold text-white">
            لا توجد منتجات
          </h2>

          <p className="mt-2 text-zinc-500">
            لم يتم العثور على منتجات تطابق البحث أو الفلاتر الحالية.
          </p>

          {(search ||
            category !== "all" ||
            featuredOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setFeaturedOnly(false);
              }}
              className="mt-5 rounded-xl bg-yellow-500 px-5 py-2 font-bold text-black hover:bg-yellow-400"
            >
              إظهار جميع المنتجات
            </button>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl sm:p-5">
          <MenuTable
            items={filteredItems}
            onToggle={toggle}
            onDelete={remove}
            onEdit={(id) =>
              router.push(
                `/admin/menu/${id}`
              )
            }
          />
        </section>
      )}
    </main>
  );
}