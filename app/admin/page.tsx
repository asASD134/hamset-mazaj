import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ExternalLink,
  Gauge,
  Globe2,
  LayoutDashboard,
  Settings,
  Trophy,
  SlidersHorizontal,
  Store,
} from "lucide-react";

import PlatformControlCenter from "@/components/admin/platform/PlatformControlCenter";

type AdminCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "yellow" | "blue" | "green" | "purple";
};

const accentClasses = {
  yellow: "border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-400",
  blue: "border-blue-500/20 bg-blue-500/[0.06] text-blue-400",
  green: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400",
  purple: "border-violet-500/20 bg-violet-500/[0.06] text-violet-400",
};

function AdminCard({ href, icon, title, description, accent = "yellow" }: AdminCardProps) {
  return (
    <Link href={href} className="group rounded-3xl border border-white/10 bg-[#0f1118] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#131722]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accentClasses[accent]}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-white">{title}</h3>
            <ChevronLeft size={18} className="shrink-0 text-zinc-600 transition group-hover:-translate-x-1 group-hover:text-yellow-400" />
          </div>
          <p className="mt-2 text-sm leading-7 text-zinc-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const rawCafe = params.cafe;
  const rawPlatform = params.platform;
  const cafeId = Array.isArray(rawCafe) ? rawCafe[0] : rawCafe;
  const platform = Array.isArray(rawPlatform) ? rawPlatform[0] : rawPlatform;

  if (platform === "1") {
    return <PlatformControlCenter />;
  }

  const previewHref = cafeId ? `/?cafe=${encodeURIComponent(cafeId)}` : "/";

  return (
    <main dir="rtl" className="min-h-screen bg-[#06070b] text-white">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-7 lg:px-10">
        <header className="overflow-hidden rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-[#15110a] via-[#0e1118] to-[#090a0e] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg"><LayoutDashboard size={28} /></div>
              <div>
                <div className="mb-2 text-xs font-black tracking-wide text-yellow-400">لوحة التحكم الرئيسية</div>
                <h1 className="text-3xl font-black sm:text-4xl">إدارة المقهى</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">من هنا تصل إلى إعدادات الموقع والصفحة الرئيسية والبطولات والمباريات، بدون البحث بين الصفحات.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={previewHref} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400"><ExternalLink size={17} />معاينة الموقع</Link>
              <Link href="/admin/staff" className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-400"><Settings size={17} />إدارة الموظفين</Link>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link href="/admin/settings" className="rounded-3xl border border-white/10 bg-[#0f1118] p-5 transition hover:border-yellow-500/30">
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-zinc-500">إعدادات الموقع</span><Settings size={20} className="text-yellow-400" /></div>
            <div className="mt-3 text-xl font-black text-white">التحكم الكامل</div>
            <p className="mt-1 text-xs text-zinc-600">بيانات المقهى، الرئيسية، التواصل وغيرها</p>
          </Link>
          <Link href="/admin/football-competitions" className="rounded-3xl border border-white/10 bg-[#0f1118] p-5 transition hover:border-violet-500/30">
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-zinc-500">البطولات</span><Trophy size={20} className="text-violet-400" /></div>
            <div className="mt-3 text-xl font-black text-white">إدارة البطولات</div>
            <p className="mt-1 text-xs text-zinc-600">إضافة وإظهار وإخفاء البطولات</p>
          </Link>
          <Link href="/admin/football-matches" className="rounded-3xl border border-white/10 bg-[#0f1118] p-5 transition hover:border-emerald-500/30">
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-zinc-500">المباريات</span><CalendarDays size={20} className="text-emerald-400" /></div>
            <div className="mt-3 text-xl font-black text-white">اختيار المباريات</div>
            <p className="mt-1 text-xs text-zinc-600">تحديد المباراة الظاهرة للزوار</p>
          </Link>
          <Link href={previewHref} target="_blank" className="rounded-3xl border border-white/10 bg-[#0f1118] p-5 transition hover:border-blue-500/30">
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-zinc-500">الموقع</span><Globe2 size={20} className="text-blue-400" /></div>
            <div className="mt-3 text-xl font-black text-white">فتح الموقع</div>
            <p className="mt-1 text-xs text-zinc-600">معاينة ما يراه الزوار</p>
          </Link>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-yellow-400"><SlidersHorizontal size={18} /><span className="text-xs font-black">إعدادات الموقع</span></div>
              <h2 className="mt-2 text-2xl font-black">كل إعدادات الموقع في مكان واحد</h2>
              <p className="mt-2 text-sm text-zinc-500">صفحات الإعدادات الموجودة حاليًا مرتبطة من هنا، بدون حذف وظائفها الحالية.</p>
            </div>
            <Link href="/admin/settings" className="hidden items-center gap-2 text-sm font-black text-yellow-400 sm:inline-flex">فتح إعدادات الموقع<ArrowLeft size={17} /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AdminCard href="/admin/settings" icon={<Store size={21} />} title="بيانات المقهى" description="اسم المقهى، الشعار، الهاتف، العنوان، أوقات العمل والوصف العام." accent="yellow" />
            <AdminCard href="/admin/settings" icon={<LayoutDashboard size={21} />} title="الصفحة الرئيسية" description="التحكم في أقسام الصفحة الرئيسية ومحتواها وظهورها." accent="blue" />
            <AdminCard href="/admin/settings" icon={<SlidersHorizontal size={21} />} title="المظهر والخطوط" description="الألوان وأحجام الخطوط وعناصر الهوية وظهورها في الموقع." accent="purple" />
            <AdminCard href="/admin/settings" icon={<Globe2 size={21} />} title="مواقع التواصل" description="إضافة وتعديل وإخفاء الحسابات والروابط الرسمية للمقهى." accent="green" />
            <AdminCard href="/admin/football-competitions" icon={<Trophy size={21} />} title="البطولات الرياضية" description="إدارة البطولات التي تظهر في الموقع وتحديد البطولات المفعلة." accent="purple" />
            <AdminCard href="/admin/football-matches" icon={<CalendarDays size={21} />} title="المباريات" description="اختيار مباراة معينة لإظهارها أو إخفائها عن الزوار، حسب اليوم أو المباشرة." accent="green" />
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-[2rem] border border-white/10 bg-[#0f1118] p-6">
            <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400"><Gauge size={20} /></div><div><h2 className="font-black">اختصارات سريعة</h2><p className="text-xs text-zinc-600">الوصول السريع للأقسام التي تستخدمها كثيرًا.</p></div></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/admin/settings" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400">إعدادات الموقع<ChevronLeft size={17} /></Link>
              <Link href="/admin/football-competitions" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400">إدارة البطولات<ChevronLeft size={17} /></Link>
              <Link href="/admin/football-matches" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400">اختيار المباريات<ChevronLeft size={17} /></Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
