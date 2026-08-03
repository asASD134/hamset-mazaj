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
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        <TableProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />

              <main className="flex-1 pt-32">
                {children}
              </main>

              <Footer />
            </div>
          </CartProvider>
        </TableProvider>
      </body>
    </html>
  );
}