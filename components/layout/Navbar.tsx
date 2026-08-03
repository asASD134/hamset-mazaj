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

export default function Navbar() {
  const pathname = usePathname();
  const { hasTable, tableNumber } = useTable();
  const [open, setOpen] = useState(false);

  const withTable = (path: string) =>
    hasTable ? `${path}?table=${tableNumber}` : path;

  const navItems = [
    { href: "/", label: "الرئيسية", icon: House },
    { href: "/menu", label: "المنيو", icon: UtensilsCrossed },
    { href: "/matches", label: "المباريات", icon: Trophy },
    { href: "/gallery", label: "المعرض", icon: Images },
    { href: "/contact", label: "تواصل", icon: Phone },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-yellow-500/20 bg-[#090909]/95 backdrop-blur-xl shadow-2xl">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid h-24 grid-cols-[1fr_auto_1fr] items-center">

            {/* Right Menu */}

            <div className="hidden lg:flex items-center justify-end gap-2">

              {navItems.slice(0, 2).map((item) => {

                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={withTable(item.href)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[16px] font-bold transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg"
                        : "text-zinc-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );

              })}

            </div>

            {/* Logo */}

            <Link
              href={withTable("/")}
              className="flex flex-col items-center justify-center"
            >

              <Image
                src="/images/logo.png"
                alt="Hamset Mazaj"
                width={58}
                height={58}
                priority
                className="object-contain drop-shadow-[0_0_20px_rgba(212,175,55,.35)]"
              />

              <h1 className="mt-1 text-xl font-black text-yellow-400">
                همسة مزاج
              </h1>

              <p className="text-[10px] uppercase tracking-[5px] text-zinc-400">
                Coffee & Lounge
              </p>

            </Link>

            {/* Left Menu */}

            <div className="hidden lg:flex items-center justify-start gap-2">

              {navItems.slice(2).map((item) => {

                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={withTable(item.href)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[16px] font-bold transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg"
                        : "text-zinc-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Button */}

            <button
              onClick={() => setOpen(true)}
              className="justify-self-end rounded-xl border border-yellow-500/20 bg-[#151515] p-3 text-yellow-400 lg:hidden"
            >
              <Menu size={26} />
            </button>

          </div>

        </div>

      </nav>
            {/* Mobile Menu */}

      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          open ? "visible bg-black/80 backdrop-blur-md" : "invisible"
        }`}
      >
        <div
          className={`absolute right-0 top-0 h-full w-80 border-l border-yellow-500/20 bg-[#090909] transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-yellow-500/20 p-6">
            <div>
              <Image
                src="/images/logo.png"
                alt="Hamset Mazaj"
                width={60}
                height={60}
                className="mb-3 object-contain"
              />

              <h2 className="text-xl font-black text-yellow-400">
                همسة مزاج
              </h2>

              <p className="text-[10px] uppercase tracking-[5px] text-zinc-400">
                Coffee & Lounge
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg bg-zinc-800 p-2"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 px-5">
            {navItems.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={withTable(item.href)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-lg font-bold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
                      : "text-white hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={24} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}