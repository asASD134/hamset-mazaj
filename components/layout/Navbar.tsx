"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  Phone,
  Trophy,
  Images,
  Bell,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useTable } from "@/context/TableContext";
import LanguageButton from "../common/LanguageButton";

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCart();
  const { hasTable, tableNumber } = useTable();

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function tableLink(path: string) {
    return hasTable ? `${path}?table=${tableNumber}` : path;
  }

  const linkClass = (path: string) =>
    `transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-xl ${
      pathname === path
        ? "bg-yellow-500 text-black font-bold"
        : "text-white hover:bg-zinc-800 hover:text-yellow-400"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/90 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        <Link
          href={tableLink("/")}
          className="flex items-center gap-3"
        >
          <Image
            src="/images/logo.png"
            alt="همسة مزاج"
            width={65}
            height={65}
            priority
          />

          <div>
            <h1 className="text-xl font-extrabold text-yellow-400">
              همسة مزاج
            </h1>

            <p className="text-xs text-gray-400">
              Coffee & Lounge
            </p>

            {hasTable && (
              <p className="text-xs font-bold text-yellow-500">
                الطاولة #{tableNumber}
              </p>
            )}
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-2">

          <Link href={tableLink("/")} className={linkClass("/")}>
            الرئيسية
          </Link>

          <Link href={tableLink("/menu")} className={linkClass("/menu")}>
            <Menu size={18} />
            المنيو
          </Link>

          <Link href={tableLink("/matches")} className={linkClass("/matches")}>
            <Trophy size={18} />
            المباريات
          </Link>

          <Link href={tableLink("/gallery")} className={linkClass("/gallery")}>
            <Images size={18} />
            المعرض
          </Link>

          <Link href={tableLink("/contact")} className={linkClass("/contact")}>
            <Phone size={18} />
            تواصل
          </Link>

          {hasTable && (
            <Link
              href={tableLink("/service")}
              className={linkClass("/service")}
            >
              <Bell size={18} />
              الخدمات
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">

          <LanguageButton />

          {hasTable && (
            <Link
              href={tableLink("/cart")}
              className="relative flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black hover:bg-yellow-400"
            >
              <ShoppingCart size={20} />
              السلة

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

        </div>

      </div>

    </header>
  );
}