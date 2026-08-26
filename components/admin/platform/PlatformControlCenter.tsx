"use client";

import {
  CalendarDays,
  ChevronDown,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  Menu,
  QrCode,
  Settings2,
  Star,
  Store,
  Trophy,
} from "lucide-react";

import AdminToolsGrid from "@/components/admin/AdminToolsGrid";
import HomeSettingsPanel from "@/components/admin/settings/HomeSettingsPanel";
import ContactSettingsPanel from "@/components/admin/settings/ContactSettingsPanel";
import CategoriesPage from "@/app/admin/categories/page";
import GalleryHomePage from "@/app/admin/gallery-home/page";
import FootballCompetitionsPage from "@/app/admin/football-competitions/page";
import FootballMatchesPage from "@/app/admin/football-matches/page";
import TableManager from "@/components/admin/tables/TableManager";
import PlatformMenuPanel from "@/components/admin/platform/PlatformMenuPanelV2";
import PlatformMenuDesignPanel from "@/components/admin/platform/PlatformMenuDesignPanel";

type SectionProps = { id: string; icon: React.ReactNode; title: string; description: string; children: React.ReactNode; defaultOpen?: boolean };

function Section({ id, icon, title, description, children, defaultOpen = false }: SectionProps) {
  return (
    <details id={id} open={defaultOpen} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1118] shadow-2xl">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">{icon}</div>
        <div className="min-w-0 flex-1"><h2 className="text-xl font-black text-white sm:text-2xl">{title}</h2><p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p></div>
        <ChevronDown className="shrink-0 text-zinc-500 transition group-open:rotate-180" size={22} />
      </summary>
      <div className="border-t border-white/10 p-3 sm:p-5">{children}</div>
    </details>
  );
}

export default function PlatformControlCenter() {
  const sections = [
    ["site-settings", "إعدادات الموقع", "الاسم، الشعار، الصفحة الرئيسية، الألوان، الخطوط وكل إعدادات الموقع الأساسية."],
    ["contact", "التواصل والخريطة", "الهاتف، واتساب، البريد، العنوان، رابط Google Maps ومواقع التواصل."],
    ["menu", "المنيو والمنتجات", "تصميم المنيو كاملًا وإضافة وتعديل المنتجات والأسعار والصور والتصنيفات."],
    ["categories", "تصنيفات المنيو", "إضافة وتعديل وحذف وترتيب تصنيفات المنيو."],
    ["gallery", "الصور والمعرض", "إدارة صور المعرض واختيار صور الصفحة الرئيسية بالنجمة."],
    ["tables", "الطاولات و QR", "إضافة وتعديل الطاولات وإدارة روابط QR الخاصة بها."],
    ["competitions", "البطولات الرياضية", "إدارة البطولات وإظهارها وإخفاؤها."],
    ["matches", "المباريات", "اختيار المباريات التي تظهر للزوار."],
  ];

  function jumpTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  return (
    <main dir="rtl" className="min-h-screen bg-[#06070b] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 mb-6 overflow-hidden rounded-[2rem] border border-yellow-500/20 bg-[#0b0d12]/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg"><LayoutDashboard size={28} /></div><div><div className="text-xs font-black text-yellow-400">الإدارة العامة</div><h1 className="mt-1 text-3xl font-black sm:text-4xl">مركز التحكم الرئيسي للمقاهي</h1><p className="mt-2 max-w-4xl text-sm leading-7 text-zinc-400">نفس لوحة أدوات المقهى المستقل، لكن في وضع الإدارة العامة ونشر التصميم والإعدادات المشتركة.</p></div></div>
            <a href="/admin/cafes" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400">العودة إلى إدارة المقاهي</a>
          </div>
          <AdminToolsGrid platform />
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{sections.map(([id, title, description]) => <button key={id} type="button" onClick={() => jumpTo(id)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-right text-xs font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400">{title}<span className="mt-1 block truncate text-[11px] font-normal text-zinc-600">{description}</span></button>)}</div>
        </header>

        <div className="space-y-6">
          <Section id="site-settings" icon={<Settings2 size={24} />} title="إعدادات الموقع الكاملة" description="الصفحة الرئيسية، Hero، الألوان، الخطوط، الخلفيات، الأقسام، الصور والهوية البصرية." defaultOpen><HomeSettingsPanel /></Section>
          <Section id="contact" icon={<MapPin size={24} />} title="التواصل والخريطة" description="كل بيانات التواصل الفعلية في مكان واحد."><ContactSettingsPanel /></Section>
          <Section id="menu" icon={<Menu size={24} />} title="المنيو والمنتجات" description="هنا تتحكم في شكل المنيو وتصميم بطاقات المنتجات، ثم تدير المنتجات نفسها."><PlatformMenuDesignPanel /><PlatformMenuPanel /></Section>
          <Section id="categories" icon={<Store size={24} />} title="تصنيفات المنيو" description="إضافة وتعديل وحذف وترتيب التصنيفات."><CategoriesPage /></Section>
          <Section id="gallery" icon={<ImageIcon size={24} />} title="الصور والمعرض" description="اختيار صور الصفحة الرئيسية وإدارة ظهور الصور."><GalleryHomePage /></Section>
          <Section id="tables" icon={<QrCode size={24} />} title="الطاولات و QR" description="الطاولات والباركود وروابط الطلب المرتبطة بكل طاولة."><TableManager /></Section>
          <Section id="competitions" icon={<Trophy size={24} />} title="البطولات الرياضية" description="إدارة البطولات التي تظهر في الموقع."><FootballCompetitionsPage /></Section>
          <Section id="matches" icon={<CalendarDays size={24} />} title="المباريات" description="إظهار وإخفاء المباريات وتحديد المباراة التي تظهر للزوار."><FootballMatchesPage /></Section>
        </div>

        <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-sm leading-7 text-yellow-100"><div className="flex items-center gap-3 font-black"><Star size={18} className="text-yellow-400" />قاعدة الإدارة العامة</div><p className="mt-2 text-zinc-400">تصميم المنيو إعداد عام مشترك للمواقع، بينما بيانات المنتجات نفسها تظل مرتبطة بكل مقهى.</p></div>
      </div>
    </main>
  );
}
