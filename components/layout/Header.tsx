"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Bell } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useTable } from "@/context/TableContext";
import SiteName from "@/components/SiteName";
import { useCafeSettings } from "@/context/CafeSettingsContext";

export default function Header() {
  const { items } = useCart();
  const { hasTable, tableNumber } = useTable();
  const { settings } = useCafeSettings();

  const cartCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  const logoUrl =
    settings.logo_url || "/images/logo.png";

  const cafeName =
    settings.cafe_name || "همسة مزاج";

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href={withTable("/")}
          className="flex items-center gap-4"
        >
          <Image
            src={logoUrl}
            alt={cafeName}
            width={60}
            height={60}
            priority
            className="rounded-full object-contain"
          />

          <div>
            <h2 className="text-2xl font-black text-yellow-400">
              <SiteName />
            </h2>

            <p className="text-sm text-zinc-400">
              Coffee • Lounge
            </p>

            {hasTable && (
              <span className="text-xs font-bold text-yellow-500">
                الطاولة #{tableNumber}
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {hasTable && (
            <>
              <Link
                href={withTable("/service")}
                aria-label="خدمات الطاولة"
                className="rounded-xl border border-yellow-500 p-3 text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
              >
                <Bell size={22} />
              </Link>

              <Link
                href={withTable("/cart")}
                aria-label="سلة الطلبات"
                className="relative rounded-xl bg-yellow-500 p-3 text-black transition hover:bg-yellow-400"
              >
                <ShoppingCart size={22} />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}