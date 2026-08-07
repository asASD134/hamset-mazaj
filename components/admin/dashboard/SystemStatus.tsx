"use client";

export default function SystemStatus() {
  const items = [
    {
      icon: "🟢",
      title: "قاعدة البيانات",
      text: "متصلة وتعمل بشكل طبيعي",
    },
    {
      icon: "⚡",
      title: "التحديث المباشر",
      text: "Realtime يعمل بدون مشاكل",
    },
    {
      icon: "📦",
      title: "الطلبات",
      text: "جاهزة لاستقبال الطلبات",
    },
    {
      icon: "🍽️",
      title: "الطاولات",
      text: "إدارة الطاولات مفعلة",
    },
  ];

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6">

      <h2 className="mb-6 text-2xl font-bold text-yellow-400">
        حالة النظام
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-zinc-800 bg-black/40 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {item.icon}
              </span>

              <div>
                <h3 className="font-bold text-white">
                  {item.title}
                </h3>

                <p className="text-sm text-zinc-400">
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}