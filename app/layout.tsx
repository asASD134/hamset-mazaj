import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { TableProvider } from "@/context/TableContext";

export const metadata: Metadata = {
  title: "همسة مزاج | Hamset Mazaj",
  description:
    "Hamset Mazaj Coffee & Lounge - Premium Coffee, Desserts, and Lounge Experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050505] text-white">
        <TableProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </TableProvider>
      </body>
    </html>
  );
}