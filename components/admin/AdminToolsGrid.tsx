import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  Globe2,
  ImageIcon,
  MapPin,
  Menu,
  PackageOpen,
  QrCode,
  Settings2,
  ShieldCheck,
  Store,
  Tags,
  Trophy,
} from "lucide-react";

type AdminToolsGridProps = {
  cafeId?: string | null;
  platform?: boolean;
};

type Tool = {
  key: string;
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  className: string;
};

function withContext(path: string, cafeId?: string | null, platform?: boolean) {
  const params = new URLSearchParams();
  if (platform) params.set("platform", "1");
  else if (cafeId) params.set("cafe", cafeId);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export default function AdminToolsGrid({ cafeId, platform = false }: AdminToolsGridProps) {
  const previewHref = cafeId ? `/?cafe=${encodeURIComponent(cafeId)}` : "/";

  const tools: Tool[] = [
    {
      key: "settings",
      href: withContext("/admin/settings", cafeId, platform),
      label: "إعدادات الموقع",
      description: "كل إعدادات الموقع والهوية والأقسام.",
      icon: <Settings2 size={22} />,
      className: "border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-400 hover:border-yellow-500/50",
    },
    {
      key: "contact",
      href: withContext("/admin/settings/contact", cafeId, platform),
      label: "التواصل والخريطة",
      description: "الهاتف، واتساب، البريد، العنوان وGoogle Maps.",
      icon: <MapPin size={22} />,
      className: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 hover:border-emerald-500/50",
    },
    {
      key: "menu",
      href: withContext("/admin/menu", cafeId, platform),
      label: "المنيو والمنتجات",
      description: "إضافة وتعديل وحذف المنتجات والأسعار والصور.",
      icon: <Menu size={22} />,
      className: "border-blue-500/20 bg-blue-500/[0.06] text-blue-400 hover:border-blue-500/50",
    },
    {
      key: "categories",
      href: withContext("/admin/categories", cafeId, platform),
      label: "تصنيفات المنيو",
      description: "إضافة وترتيب وتعديل تصنيفات المنيو.",
      icon: <Tags size={22} />,
      className: "border-violet-500/20 bg-violet-500/[0.06] text-violet-400 hover:border-violet-500/50",
    },
    {
      key: "gallery",
      href: withContext("/admin/gallery-home", cafeId, platform),
      label: "الصور والمعرض",
      description: "إدارة الصور واختيار صور الصفحة الرئيسية.",
      icon: <ImageIcon size={22} />,
      className: "border-pink-500/20 bg-pink-500/[0.06] text-pink-400 hover:border-pink-500/50",
    },
    {
      key: "tables",
      href: withContext("/admin/tables", cafeId, platform),
      label: "الطاولات و QR",
      description: "الطاولات والباركود وروابط الطلب.",
      icon: <QrCode size={22} />,
      className: "border-orange-500/20 bg-orange-500/[0.06] text-orange-400 hover:border-orange-500/50",
    },
    {
      key: "competitions",
      href: withContext("/admin/football-competitions", cafeId, platform),
      label: "البطولات الرياضية",
      description: "إدارة البطولات وترتيبها وإظهارها.",
      icon: <Trophy size={22} />,
      className: "border-purple-500/20 bg-purple-500/[0.06] text-purple-400 hover:border-purple-500/50",
    },
    {
      key: "matches",
      href: withContext("/admin/football-matches", cafeId, platform),
      label: "المباريات",
      description: "اختيار المباريات وإظهارها أو إخفاؤها.",
      icon: <CalendarDays size={22} />,
      className: "border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-400 hover:border-cyan-500/50",
    },
    {
      key: "orders",
      href: withContext("/admin/orders", cafeId, platform),
      label: "الطلبات",
      description: "متابعة وإدارة طلبات المقهى.",
      icon: <PackageOpen size={22} />,
      className: "border-amber-500/20 bg-amber-500/[0.06] text-amber-400 hover:border-amber-500/50",
    },
    {
      key: "staff",
      href: withContext("/admin/staff", cafeId, platform),
      label: "موظفو المقهى",
      description: "إدارة الموظفين وصلاحياتهم.",
      icon: <ShieldCheck size={22} />,
      className: "border-slate-500/20 bg-slate-500/[0.06] text-slate-300 hover:border-slate-400/50",
    },
  ];

  return (
    <section className="mt-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-yellow-400">
            <Store size={18} />
            <span className="text-xs font-black">أدوات إدارة المقهى</span>
          </div>
          <h2 className="mt-1 text-2xl font-black">كل أدوات التعديل أمامك</h2>
          <p className="mt-1 text-sm text-zinc-500">نفس الأدوات تظهر في الإدارة العامة وكل مقهى مستقل.</p>
        </div>

        <Link
          href={previewHref}
          target="_blank"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-yellow-500/30 hover:text-yellow-400 sm:self-auto"
        >
          <Globe2 size={17} />
          معاينة الموقع
          <ExternalLink size={15} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tools.map((tool) => (
          <Link
            key={tool.key}
            href={tool.href}
            className={`group rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05] ${tool.className}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/20">
                {tool.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-white">{tool.label}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
