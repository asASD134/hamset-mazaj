const matches = [
  {
    title: "🏆 نهائي كأس العالم 2026",
    team1: "🇪🇸 إسبانيا",
    team2: "🇦🇷 الأرجنتين",
    time: "10:00 مساءً",
    date: "الأحد 19 يوليو 2026",
  },
  {
    title: "🥉 مباراة المركز الثالث",
    team1: "🇫🇷 فرنسا",
    team2: "🏴 إنجلترا",
    time: "12:00 صباحًا",
    date: "الأحد 19 يوليو 2026",
  },
];

export default function MatchesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">

      <h1 className="text-5xl font-bold text-center text-yellow-400 mb-4">
        ⚽ مباريات همسة مزاج
      </h1>

      <p className="text-center text-gray-300 mb-12">
        استمتع بمشاهدة أهم المباريات على الشاشات الكبيرة داخل المقهى.
      </p>

      <div className="max-w-5xl mx-auto grid gap-8">

        {matches.map((match, index) => (
          <div
            key={index}
            className="bg-zinc-900 rounded-3xl border border-yellow-500/30 p-8 shadow-lg hover:border-yellow-400 transition"
          >
            <h2 className="text-2xl text-yellow-400 font-bold text-center mb-6">
              {match.title}
            </h2>

            <div className="flex justify-center items-center gap-6 text-3xl font-bold flex-wrap">
              <span>{match.team1}</span>
              <span className="text-yellow-400">VS</span>
              <span>{match.team2}</span>
            </div>

            <div className="mt-8 text-center space-y-2 text-lg">
              <p>📅 {match.date}</p>
              <p>🕙 {match.time}</p>
              <p>📺 تُعرض المباراة داخل مقهى همسة مزاج</p>
            </div>

            <div className="mt-8 flex justify-center">
              <a
                href="/contact"
                className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition"
              >
                احجز جلستك الآن
              </a>
            </div>
          </div>
        ))}

      </div>

      <section className="mt-16 bg-zinc-900 rounded-3xl max-w-5xl mx-auto p-8 border border-yellow-500/30">
        <h2 className="text-3xl text-yellow-400 font-bold text-center mb-6">
          🎉 عروض المباريات
        </h2>

        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-yellow-400 font-bold mb-2">
              ☕ القهوة
            </h3>
            <p>استمتع بمشروبك المفضل أثناء المباراة.</p>
          </div>

          <div>
            <h3 className="text-yellow-400 font-bold mb-2">
              🛋️ جلسات مريحة
            </h3>
            <p>جلسات مخصصة لمتابعة المباريات مع الأصدقاء.</p>
          </div>

          <div>
            <h3 className="text-yellow-400 font-bold mb-2">
              📺 شاشات كبيرة
            </h3>
            <p>عرض المباريات بجودة عالية وأجواء رياضية مميزة.</p>
          </div>
        </div>
      </section>

    </main>
  );
}