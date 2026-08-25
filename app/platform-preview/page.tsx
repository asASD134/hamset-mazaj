"use client";

import { useEffect } from "react";
import Home from "@/app/page";

export default function PlatformPreviewPage() {
  useEffect(() => {
    document.title = "معاينة المنصة - همسة مزاج";
  }, []);

  return (
    <>
      <div className="sticky top-0 z-[100] border-b border-yellow-500/20 bg-black/90 px-4 py-2 text-center text-xs font-black text-yellow-300 backdrop-blur">
        وضع معاينة المنصة — التعديلات العامة تظهر هنا، وأصول المعاينة تبقى داخل هذه المعاينة فقط.
      </div>
      <Home />
    </>
  );
}
