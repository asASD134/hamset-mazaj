"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Home from "@/app/page";

export default function PlatformPreviewPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "معاينة المنصة - الإدارة العامة";
    if (window.location.search !== "?platformPreview=1") {
      router.replace("/platform-preview?platformPreview=1");
    }
  }, [router]);

  return (
    <>
      <div className="sticky top-0 z-[100] border-b border-yellow-500/20 bg-black/90 px-4 py-2 text-center text-xs font-black text-yellow-300 backdrop-blur">
        وضع معاينة الإدارة العامة — المعاينة تقرأ بيانات قالب المنصة مباشرة.
      </div>
      <Home />
    </>
  );
}
